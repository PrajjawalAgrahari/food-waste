package com.example.backend.users;

import java.time.LocalTime;
import java.util.List;

import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
