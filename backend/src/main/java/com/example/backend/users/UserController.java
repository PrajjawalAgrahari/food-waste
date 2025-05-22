package com.example.backend.users;

import java.security.Principal;
import java.time.LocalTime;
import java.util.List;

import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

  private final UserRepository userRepository;

  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/users")
  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  @GetMapping("/users/{id}")
  public User getUserById(@PathVariable Long id) {
    return userRepository.findById(id).orElse(null);
  }

  @GetMapping("/users/donors")
  public List<User> getAllDonors() {
    return userRepository.findByRole("DONOR");
  }

  @PatchMapping("/users/{userId}/availability")
  public ResponseEntity<?> updateAvailability(
    @PathVariable Long userId,
    @RequestBody AvailabilityRequest request
  ) {
    Optional<User> optionalUser = userRepository.findById(userId);
    if (optionalUser.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    User user = optionalUser.get();
    user.setAvailabilityTimeFrom(request.getAvailabilityTimeFrom());
    user.setAvailabilityTimeTo(request.getAvailabilityTimeTo());
    userRepository.save(user);

    return ResponseEntity.ok().build();
  }

  @PutMapping("/users/profile")
  public ResponseEntity<?> updateUserProfile(@RequestBody User updatedUser, Principal principal) {
    try {
      // Get the currently authenticated user's email
      String currentUserEmail = principal.getName();

      // Find the user in the database
      User existingUser = userRepository.findByEmail(currentUserEmail);

      if (existingUser == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found");
      }

      // Update fields (don't update sensitive fields like password here)
      if (updatedUser.getHomeLat() != null) {
        existingUser.setHomeLat(updatedUser.getHomeLat());
      }

      if (updatedUser.getHomeLon() != null) {
        existingUser.setHomeLon(updatedUser.getHomeLon());
      }

      if (updatedUser.getAvailabilityTimeFrom() != null) {
        existingUser.setAvailabilityTimeFrom(updatedUser.getAvailabilityTimeFrom());
      }

      if (updatedUser.getAvailabilityTimeTo() != null) {
        existingUser.setAvailabilityTimeTo(updatedUser.getAvailabilityTimeTo());
      }

      // Add UPI fields if they exist in your User entity
      if (updatedUser.getUpiId() != null) {
        existingUser.setUpiId(updatedUser.getUpiId());
      }

      if (updatedUser.getPaymentQrCodeUrl() != null) {
        existingUser.setPaymentQrCodeUrl(updatedUser.getPaymentQrCodeUrl());
      }

      // Save the updated user
      User savedUser = userRepository.save(existingUser);

      // Remove sensitive information before returning
      savedUser.setPasswordHash(null);

      return ResponseEntity.ok(savedUser);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body("Error updating profile: " + e.getMessage());
    }
  }

  // Request class
  static class AvailabilityRequest {

    private LocalTime availabilityTimeFrom;
    private LocalTime availabilityTimeTo;

    // Getters and setters
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
}
