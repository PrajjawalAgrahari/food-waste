package com.example.backend.foodItems;

import java.util.Date;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.CompletionField;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.core.suggest.Completion;

@Document(indexName = "food_items")
public class FoodItemDocument {

  @Id
  private String id;

  @Field(type = FieldType.Text, analyzer = "standard")
  private String name;

  @Field(type = FieldType.Text, analyzer = "standard")
  private String pickupLocation;

  @Field(type = FieldType.Integer)
  private Integer quantity;

  @Field(type = FieldType.Date)
  private Date expiryDate;

  @Field(type = FieldType.Long)
  private Long donorId;

  // Add completion field for autocomplete
  @CompletionField(maxInputLength = 100)
  private Completion nameSuggest;

  // Constructor to convert from FoodItems entity
  public static FoodItemDocument fromEntity(FoodItems entity) {
    FoodItemDocument document = new FoodItemDocument();
    document.setId(entity.getId().toString());
    document.setName(entity.getName());
    document.setPickupLocation(entity.getPickupLocation());
    document.setQuantity(entity.getQuantity());
    document.setExpiryDate(entity.getExpiryDate());
    document.setDonorId(entity.getDonorId());

    // Set up completion field with name for suggestions
    Completion nameSuggest = new Completion(new String[] { entity.getName() });
    document.setNameSuggest(nameSuggest);

    return document;
  }

  // Getters and setters

  public Completion getNameSuggest() {
    return nameSuggest;
  }

  public void setNameSuggest(Completion nameSuggest) {
    this.nameSuggest = nameSuggest;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPickupLocation() {
    return pickupLocation;
  }

  public void setPickupLocation(String pickupLocation) {
    this.pickupLocation = pickupLocation;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public Date getExpiryDate() {
    return expiryDate;
  }

  public void setExpiryDate(Date expiryDate) {
    this.expiryDate = expiryDate;
  }

  public Long getDonorId() {
    return donorId;
  }

  public void setDonorId(Long donorId) {
    this.donorId = donorId;
  }
}
