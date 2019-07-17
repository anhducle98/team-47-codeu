package com.google.codeu.servlets;

import com.google.gson.Gson;
import com.google.gson.JsonArray;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import com.google.appengine.api.search.GeoPoint;

import com.google.codeu.data.Datastore;
import com.google.codeu.data.Message;

import java.util.logging.Logger;

@WebServlet("/search")
public class SearchServlet extends HttpServlet {
  private static Logger LOGGER = Logger.getLogger(SearchServlet.class.getName());

  private Datastore datastore;

  @Override
  public void init() {
    datastore = new Datastore();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    List<Message> messages = datastore.getAllMessages();

    double lowerbound = Double.parseDouble(request.getParameter("lowerbound"));
    double upperbound = Double.parseDouble(request.getParameter("upperbound"));
    GeoPoint center = new GeoPoint(Double.parseDouble(request.getParameter("latitude")), Double.parseDouble(request.getParameter("longitude")));
    filterByRadius(messages, center, lowerbound, upperbound);

    for (Message message : messages) {
      message.replaceImage();
      message.appendImage();
    }

    Gson gson = new Gson();
    String json = gson.toJson(messages);
    response.getOutputStream().println(json);
  }

  // A super naive way to do range search
  private void filterByRadius(List<Message> messages, GeoPoint center, double lowerbound, double upperbound) {
    for (int i = messages.size() - 1; i >= 0; --i) {
      double curDistance = getDistance(messages.get(i).getLocation(), center);
      //LOGGER.info(messages.get(i).getText() + " | distance = " + curDistance);
      if (curDistance < lowerbound || curDistance > upperbound) {
        messages.remove(i);
      }
    }
  }

  // returns distance in meters
  private double getDistance(GeoPoint from, GeoPoint to) {
    double lat1 = from.getLatitude();
    double lat2 = to.getLatitude();
    double lng1 = from.getLongitude();
    double lng2 = to.getLongitude();

    double earthRadius = 6371000; //meters
    double dLat = Math.toRadians(lat2-lat1);
    double dLng = Math.toRadians(lng2-lng1);
    double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
               Math.sin(dLng/2) * Math.sin(dLng/2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    double dist = (double) (earthRadius * c);

    return dist;
  }
}
