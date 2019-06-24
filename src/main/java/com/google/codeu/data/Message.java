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

import java.util.UUID;
import java.util.List;

import com.google.appengine.api.images.*;
import com.google.appengine.api.blobstore.*;
import com.google.cloud.vision.v1.EntityAnnotation;

/** A single message posted by a user. */
public class Message {

  private UUID id;
  private String user;
  private String text;
  private long timestamp;
  private BlobKey imageBlobKey;
  private String imageLabels;

  /**
   * Constructs a new {@link Message} posted by {@code user} with {@code text} content. Generates a
   * random ID and uses the current system time for the creation time.
   */
  public Message(String user, String text, BlobKey imageBlobKey, List<EntityAnnotation> labelsList) {
    this(UUID.randomUUID(), user, text, System.currentTimeMillis(), imageBlobKey, joinImageLabes(labelsList));
  }

  public Message(String user, String text, BlobKey imageBlobKey, String imageLabels) {
    this(UUID.randomUUID(), user, text, System.currentTimeMillis(), imageBlobKey, imageLabels);
  }

  public Message(UUID id, String user, String text, long timestamp, BlobKey imageBlobKey, String imageLabels) {
    this.id = id;
    this.user = user;
    this.text = text;
    this.timestamp = timestamp;
    this.imageBlobKey = imageBlobKey;
    this.imageLabels = imageLabels;
  }

  private static String joinImageLabes(List<EntityAnnotation> labelsList) {
    if (labelsList == null) return "";

    String result = "";
    for (int i = 0; i < labelsList.size(); ++i) {
      result += "#" + labelsList.get(i).getDescription();
      if (i + 1 < labelsList.size()) {
        result += ", ";
      }
    }
    return result;
  }

  public UUID getId() {
    return id;
  }

  public String getUser() {
    return user;
  }

  public String getText() {
    return text;
  }

  public void setText(String newText) {
    text = newText;
  }

  public long getTimestamp() {
    return timestamp;
  }

  public BlobKey getImageBlobKey() {
    return imageBlobKey;
  }

  public String getImageLabels() {
    return imageLabels;
  }

  public void replaceImage() {
    String regex = "(?:\\[(.+)\\])?(https?:([/|\\.|\\w|\\s|\\-|%])*\\.(?:jpg|gif|png))";
    String replacement = "<img src=\"$2\" title=\"$1\"/>";
    text = text.replaceAll(regex, replacement);
  }

  public static String getImageUrlFromBlobKey(BlobKey blobKey) {
    // Use ImagesService to get a URL that points to the uploaded file.
    ImagesService imagesService = ImagesServiceFactory.getImagesService();
    ServingUrlOptions options = ServingUrlOptions.Builder.withBlobKey(blobKey);
    return imagesService.getServingUrl(options);
  }

  public void appendImage() {
    if (imageBlobKey != null) {
      text += "<img src=\"" + getImageUrlFromBlobKey(imageBlobKey) + "\"/>";
    }
    appendImageLabels();
  }

  private void appendImageLabels() {
    if (imageLabels != null && imageLabels != "") {
      text += "<p>Suggested tags: " + imageLabels + "</p>";
    }
  }
}
