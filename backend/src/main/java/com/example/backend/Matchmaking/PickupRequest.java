package com.example.backend.Matchmaking;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity class representing a pickup request in the food donation system.
 * This class maps to the pickup_requests table that connects food donors with receivers.
 */
@Entity
@Table(name = "pickup_requests")
public class PickupRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "delivery_number")
  private String deliveryNumber;

  @Column(name = "receiver_id", nullable = false)
  private Long receiverId;

  @Column(name = "donor_id", nullable = false)
  private Long donorId;

  @Column(name = "food_item_id", nullable = false)
  private Long foodItemId;

  @Column(name = "pickup_date", nullable = false)
  private LocalDate pickupDate;

  @Column(name = "pickup_time", nullable = false)
  private LocalTime pickupTime;

  @Column(name = "quantity", nullable = false)
  private Integer quantity;

  @Column(name = "status", nullable = false, length = 20)
  private String status = "PENDING";

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Date createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private Date updatedAt;

  // Constructors
  public PickupRequest() {}

  public PickupRequest(
    Long receiverId,
    Long donorId,
    LocalDate pickupDate,
    LocalTime pickupTime,
    Integer quantity,
    Long foodItemId,
    String deliveryNumber
  ) {
    this.receiverId = receiverId;
    this.donorId = donorId;
    this.pickupDate = pickupDate;
    this.pickupTime = pickupTime;
    this.quantity = quantity;
    this.status = "PENDING";
    this.foodItemId = foodItemId;
    this.deliveryNumber = deliveryNumber;
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getReceiverId() {
    return receiverId;
  }

  public void setReceiverId(Long receiverId) {
    this.receiverId = receiverId;
  }

  public Long getDonorId() {
    return donorId;
  }

  public void setDonorId(Long donorId) {
    this.donorId = donorId;
  }

  public Long getFoodItemId() {
    return foodItemId;
  }

  public String getDeliveryNumber() {
    return deliveryNumber;
  }

  public void setDeliveryNumber(String deliveryNumber) {
    this.deliveryNumber = deliveryNumber;
  }

  public void setFoodItemId(Long foodItemId) {
    this.foodItemId = foodItemId;
  }

  public LocalDate getPickupDate() {
    return pickupDate;
  }

  public void setPickupDate(LocalDate pickupDate) {
    this.pickupDate = pickupDate;
  }

  public LocalTime getPickupTime() {
    return pickupTime;
  }

  public void setPickupTime(LocalTime pickupTime) {
    this.pickupTime = pickupTime;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public Date getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Date updatedAt) {
    this.updatedAt = updatedAt;
  }
}
