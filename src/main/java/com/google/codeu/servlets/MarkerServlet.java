package com.google.codeu.servlets;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Scanner;
import java.util.List;
import java.lang.String;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import java.util.ArrayList;
import java.util.logging.Logger;

@WebServlet("/markers")
public class MarkerServlet extends HttpServlet {

  private static Logger logger = Logger.getLogger(MarkerServlet.class.getName());

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    List<Marker> markers = getMarkers();
    Gson gson = new Gson();
    String json = gson.toJson(markers);

    response.getOutputStream().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) {
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    String content = Jsoup.clean(request.getParameter("content"), Whitelist.none());

    Marker marker = new Marker(lat, lng, content);
    storeMarker(marker);
  }

  private List<Marker> getMarkers() {
    List<Marker> markers = new ArrayList<>();

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query("Marker");
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      double lat = (double) entity.getProperty("lat");
      double lng = (double) entity.getProperty("lng");
      String content = (String) entity.getProperty("content");

      Marker marker = new Marker(lat, lng, content);
      markers.add(marker);
    }
    return markers;
  }

  public void storeMarker(Marker marker) {
    Entity markerEntity = new Entity("Marker");
    markerEntity.setProperty("lat", marker.getLat());
    markerEntity.setProperty("lng", marker.getLng());
    markerEntity.setProperty("content", marker.getContent());

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(markerEntity);
  }

  private static class Marker {
    double lat;
    double lng;
    String content;

    private Marker(double lat, double lng, String content) {
        this.lat = lat;
        this.lng = lng;
        this.content = content;
    }

    public double getLat() {
      return lat;
    }
    
    public double getLng() {
      return lng;
    }

    public String getContent() {
      return content;
    }
  }
}
