package com.example.backend.users;

import com.example.backend.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserService userService;
  private final UserRepository userRepository;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider jwtTokenProvider;

  public AuthController(
    UserService userService,
    UserRepository userRepository,
    AuthenticationManager authenticationManager,
    JwtTokenProvider jwtTokenProvider
  ) {
    this.userService = userService;
    this.userRepository = userRepository;
    this.authenticationManager = authenticationManager;
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Authenticated");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

  @PostMapping("/register")
  public ResponseEntity<?> registerUser(@RequestBody User user) {
    try {
      // Set creation time
      user.setCreatedAt(LocalDateTime.now());
      user.setAvailabilityTimeFrom(LocalTime.parse("09:00:00"));
      user.setAvailabilityTimeTo(LocalTime.parse("17:00:00"));
      // Register user (this will hash the password)
      userService.register(user);

      Map<String, String> response = new HashMap<>();
      response.put("message", "User registered successfully");
      return new ResponseEntity<>(response, HttpStatus.CREATED);
    } catch (Exception e) {
      Map<String, String> response = new HashMap<>();
      response.put("message", "Registration failed: " + e.getMessage());
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
    try {
      Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
          loginRequest.getEmail(),
          loginRequest.getPassword()
        )
      );

      SecurityContextHolder.getContext().setAuthentication(authentication);

      // Generate JWT token
      String token = jwtTokenProvider.generateToken(
        (UserDetails) authentication.getPrincipal()
      );

      User user = userRepository.findByEmail(loginRequest.getEmail());

      Map<String, Object> response = new HashMap<>();
      response.put("token", token);
      response.put("userId", user.getId());
      response.put("username", user.getUsername());
      response.put("email", user.getEmail());
      response.put("role", user.getRole());

      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (Exception e) {
      Map<String, String> response = new HashMap<>();
      response.put("message", "Login failed: " + e.getMessage());
      return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
  }

  static class LoginRequest {

    private String email;
    private String password;

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }
  }
}
