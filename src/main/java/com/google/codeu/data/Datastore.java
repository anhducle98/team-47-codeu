/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.codeu.data;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.blobstore.*;
import com.google.appengine.api.images.*;
import com.google.appengine.api.search.GeoPoint;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.cloud.vision.v1.EntityAnnotation;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import com.google.appengine.api.datastore.EntityNotFoundException;
import java.util.logging.Logger;

import java.util.*;

class RankingItem {
  public String user;
  public int postCount;

  public RankingItem(String user, int postCount) {
    this.user = user;
    this.postCount = postCount;
  }
}

/** Provides access to the data stored in Datastore. */
public class Datastore {

  private DatastoreService datastore;

  private static Logger logger = Logger.getLogger(Datastore.class.getName());

  public Datastore() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  /** Stores the Message in Datastore. */
  public void storeMessage(Message message) {
    Entity messageEntity = new Entity("Message", message.getId().toString());
    messageEntity.setProperty("user", message.getUser());
    messageEntity.setProperty("text", message.getText());
    messageEntity.setProperty("timestamp", message.getTimestamp());
    messageEntity.setProperty("imageBlobKey", message.getImageBlobKey());
    messageEntity.setProperty("imageLabels", message.getImageLabels());
    messageEntity.setProperty("location_lat", message.getLocation().getLatitude());
    messageEntity.setProperty("location_lng", message.getLocation().getLongitude());
    datastore.put(messageEntity);
  }

  public void deleteMessage(String user, String postId) throws EntityNotFoundException {
    Key key = KeyFactory.createKey("Message", postId);
    Entity messageEntity = datastore.get(key);
    String messageUser = (String) messageEntity.getProperty("user");
    if (!messageUser.equals(user)) {
      return;
    }
    datastore.delete(key);
  }

  public Set<String> getUsers() {
    Set<String> users = new HashSet<>();
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    for (Entity entity : results.asIterable()) {
      users.add((String) entity.getProperty("user"));
    }
    return users;
  }

  /**
   * Do a query of messages on datastore
   */
  private List<Message> queryMessages(Query query) {
    List messages = new ArrayList<>();
    PreparedQuery results = datastore.prepare(query);
    for (Entity entity : results.asIterable()) {
      try {
        UUID id = UUID.fromString(entity.getKey().getName());
        String user = (String) entity.getProperty("user");
        String text = (String) entity.getProperty("text");
        long timestamp = (long) entity.getProperty("timestamp");
        BlobKey imageBlobKey = (BlobKey) entity.getProperty("imageBlobKey");
        String imageLabels = (String) entity.getProperty("imageLabels");
        double lat = (double) entity.getProperty("location_lat");
        double lng = (double) entity.getProperty("location_lng");
        GeoPoint location = new GeoPoint(lat, lng);

        Message message = new Message(id, user, text, timestamp, imageBlobKey, imageLabels, location);
        messages.add(message);
      } catch (Exception e) {
        System.err.println("Error reading message.");
        System.err.println(entity.toString());
        e.printStackTrace();
      }
    }
    return messages;
  }

  /**
   * Gets messages posted by a specific user.
   *
   * @return a list of messages posted by the user, or empty list if user has
   *         never posted a message. List is sorted by time descending.
   */
  public List<Message> getMessages(String user) {
    return queryMessages(new Query("Message").setFilter(new Query.FilterPredicate("user", FilterOperator.EQUAL, user))
        .addSort("timestamp", SortDirection.DESCENDING));
  }

  /**
   * Gets all messages
   *
   * @return a list of all messages posted by any user. List is sorted by time
   *         descending.
   */
  public List<Message> getAllMessages() {
    return queryMessages(new Query("Message").addSort("timestamp", SortDirection.DESCENDING));
  }

  /** Returns the total number of messages for all users. */
  public int getTotalMessageCount() {
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    return results.countEntities(FetchOptions.Builder.withLimit(1000));
  }

  /**
   * Get top 10 users with most posts
   * 
   * @return a list of at most 10 users with most posts, each element is in the
   *         form { user, postCount }
   */
  public JsonArray getRanking() {
    List<RankingItem> ranking = new ArrayList<>();
    Set<String> userList = getUsers();
    for (String user : userList) {
      RankingItem item = new RankingItem(user, getMessages(user).size());
      ranking.add(item);
    }

    Collections.sort(ranking, new Comparator<RankingItem>() {
      @Override
      public int compare(RankingItem a, RankingItem b) {
        return -a.postCount + b.postCount;
      }
    });

    Gson gson = new Gson();
    String jsonString = gson.toJson(ranking.subList(0, Math.min(ranking.size(), 10)));
    JsonParser parser = new JsonParser();
    return parser.parse(jsonString).getAsJsonArray();
  }

  /**
   * Get list of messages' post time.
   * 
   * @return a list of of post time of all posts in database
   */
  public JsonArray getDayChart() {
    List<Long> timeList = new ArrayList<>();
    for (Message message : getAllMessages()) {
      timeList.add(message.getTimestamp());
    }
    Gson gson = new Gson();
    String jsonString = gson.toJson(timeList);
    JsonParser parser = new JsonParser();
    return parser.parse(jsonString).getAsJsonArray();
  }
}
