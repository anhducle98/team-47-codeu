package com.google.codeu.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import java.util.Scanner;

@WebServlet("/bookchart")
public class ChartServlet extends HttpServlet {
  private JsonArray bookRatingArray;

  private static class bookRating {
    public String title;
    public double rating;

    private bookRating(String title, double rating) {
      this.title = title;
      this.rating = rating;
    }
  }

  @Override
  public void init() {
    bookRatingArray = new JsonArray();
    Gson gson = new Gson();
    Scanner scanner = new Scanner(getServletContext().getResourceAsStream("/WEB-INF/book-ratings.csv"));
    scanner.nextLine();
    while (scanner.hasNextLine()) {
      String line = scanner.nextLine();
      String[] cells = line.split(",");

      String curTitle = cells[5];
      double curRating = Double.parseDouble(cells[6]);

      bookRatingArray.add(gson.toJsonTree(new bookRating(curTitle, curRating)));
    }
    scanner.close();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    response.getOutputStream().println(bookRatingArray.toString());
  }
}