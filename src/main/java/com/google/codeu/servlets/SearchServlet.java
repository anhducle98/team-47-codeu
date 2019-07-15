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

@WebServlet("/search")
public class SearchServlet extends HttpServlet {
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

  private void filterByRadius(List<Message> messages, GeoPoint center, double lowerbound, double upperbound) {
    for (int i = messages.size() - 1; i >= 0; --i) {
      double curDistance = getDistance(messages.get(i).getLocation(), center);
      if (curDistance < lowerbound || curDistance > upperbound) {
        messages.remove(i);
      }
    }
  }

  // returns distance in meters
  private double getDistance(GeoPoint a, GeoPoint b) {
    double lat1 = a.getLatitude();
    double lat2 = b.getLatitude();
    double lon1 = a.getLongitude();
    double lon2 = b.getLongitude();
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      double theta = lon1 - lon2;
      double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
      dist = Math.acos(dist);
      dist = Math.toDegrees(dist);
      dist = dist * 60 * 1.1515;
      return dist;
    }
  }
}
