package com.google.codeu.servlets;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.codeu.data.Datastore;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

/**
 * Responds with a hard-coded message for testing purposes.
 */
@WebServlet("/stats")
public class StatsPageServlet extends HttpServlet {

  private Datastore datastore;

  @Override
  public void init() {
    datastore = new Datastore();
  }

  /**
   * Responds with site statistics in JSON.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    JsonObject jsonObject = new JsonObject();
    jsonObject.addProperty("messageCount", datastore.getTotalMessageCount());
    jsonObject.add("ranking", datastore.getRanking());
    response.getOutputStream().println(jsonObject.toString());
  }
}
