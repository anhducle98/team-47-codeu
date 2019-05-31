package com.google.codeu.servlets;

import com.google.codeu.data.Datastore;
import com.google.gson.Gson;

import java.io.IOException;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Handles fetching all users for the community page.
 */
@WebServlet("/user-list")
public class UserListServlet extends HttpServlet {
  private Datastore datastore;

  @Override
  public void init() throws ServletException {
    super.init();
    datastore = new Datastore();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    Set<String> userList = datastore.getUsers();
    String json = new Gson().toJson(userList);
    response.getOutputStream().println(json);
  }
}
