package com.example.backend.users;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "username", length = 50)
  private String username;

  @Column(name = "password_hash", length = 255)
  private String passwordHash;

  @Column(name = "email", length = 255)
  private String email;

  @Column(name = "role", length = 20)
  private String role;

  @Column(
    name = "created_at",
    columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
  )
  private LocalDateTime createdAt;

  @Column(name = "home_lat", columnDefinition = "numeric(9,6)")
  private Double homeLat;

  @Column(name = "home_lon", columnDefinition = "numeric(9,6)")
  private Double homeLon;

  @Column(name = "availability_time_from")
  private LocalTime availabilityTimeFrom;

  @Column(name = "availability_time_to")
  private LocalTime availabilityTimeTo;

  // Constructors
  public User() {}

  public User(
    String username,
    String passwordHash,
    String email,
    String role,
    Double homeLat,
    Double homeLon
  ) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.email = email;
    this.role = role;
    this.homeLat = homeLat;
    this.homeLon = homeLon;
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public Double getHomeLat() {
    return homeLat;
  }

  public void setHomeLat(Double homeLat) {
    this.homeLat = homeLat;
  }

  public Double getHomeLon() {
    return homeLon;
  }

  public void setHomeLon(Double homeLon) {
    this.homeLon = homeLon;
  }

  public LocalTime getAvailabilityTimeFrom() {
    return availabilityTimeFrom;
  }

  public void setAvailabilityTimeFrom(LocalTime availabilityTimeFrom) {
    this.availabilityTimeFrom = availabilityTimeFrom;
  }

  public LocalTime getAvailabilityTimeTo() {
    return availabilityTimeTo;
  }

  public void setAvailabilityTimeTo(LocalTime availabilityTimeTo) {
    this.availabilityTimeTo = availabilityTimeTo;
  }
}
