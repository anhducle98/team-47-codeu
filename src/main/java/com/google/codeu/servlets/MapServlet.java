package com.google.codeu.servlets;

import com.google.gson.Gson;
import com.google.gson.JsonArray;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Scanner;

@WebServlet("/map")
public class MapServlet extends HttpServlet {

  private JsonArray earthquakeLocations;

  @Override
  public void init() {
    earthquakeLocations = new JsonArray();
    Gson gson = new Gson();
    Scanner scanner = new Scanner(getServletContext().getResourceAsStream("/WEB-INF/earthquake.csv"));
    boolean firstTime = true;
    while (scanner.hasNextLine()) {
      String line = scanner.nextLine();
      String[] cells = line.split(",");
      if (firstTime) { //skip first line because it contains column names
        firstTime = false;
        continue;
      }

      double lat = Double.parseDouble(cells[2]);
      double lng = Double.parseDouble(cells[3]);
      earthquakeLocations.add(gson.toJsonTree(new EarthquakeLocation(lat, lng)));
    }
    scanner.close();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    response.getOutputStream().println(earthquakeLocations.toString());
  }

  private static class EarthquakeLocation {
    double lat;
    double lng;

    private EarthquakeLocation(double lat, double lng) {
      this.lat = lat;
      this.lng = lng;
    }
  }
}
