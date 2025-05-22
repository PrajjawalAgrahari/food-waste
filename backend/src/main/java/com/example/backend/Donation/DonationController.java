package com.example.backend.Donation;

import com.example.backend.users.User;
import com.example.backend.users.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "http://localhost:5173")
public class DonationController {

  private final DonationRepository donationRepository;
  private final UserRepository userRepository;

  public DonationController(
    DonationRepository donationRepository,
    UserRepository userRepository
  ) {
    this.donationRepository = donationRepository;
    this.userRepository = userRepository;
  }

  @PostMapping("/intent")
  public ResponseEntity<?> createPaymentIntent(
    @RequestBody DonationRequest request
  ) {
    try {
      // Fetch donor and receiver User entities by ID
      User donor = userRepository
        .findById(request.getDonorId())
        .orElseThrow(() -> new RuntimeException("Donor not found"));
      User receiver = userRepository
        .findById(request.getReceiverId())
        .orElseThrow(() -> new RuntimeException("Receiver not found"));

      Donation donation = new Donation();
      donation.setDonor(donor);
      donation.setReceiver(receiver);
      donation.setAmount(request.getAmount());
      donation.setMessage(request.getMessage());
      donation.setCreatedAt(LocalDateTime.now());
      donation.setCompleted(false);

      Donation savedDonation = donationRepository.save(donation);

      return ResponseEntity.status(201).body(savedDonation);
    } catch (Exception e) {
      return ResponseEntity
        .status(500)
        .body("Error creating payment intent: " + e.getMessage());
    }
  }

  @PostMapping("/confirm/{donationId}")
  public ResponseEntity<?> confirmDonation(@PathVariable Long donationId) {
    try {
      System.out.println("Donation ID: " + donationId);
      Donation donation = donationRepository
        .findById(donationId)
        .orElseThrow(() -> new RuntimeException("Donation not found"));

      // Update the donation status to completed
      donation.setCompleted(true);
      donationRepository.save(donation);

      return ResponseEntity.ok(donation);
    } catch (Exception e) {
      return ResponseEntity
        .status(500)
        .body("Error confirming donation: " + e.getMessage());
    }
  }

  static class DonationRequest {

    private Long donorId;
    private Long receiverId;
    private BigDecimal amount;
    private String message;

    public Long getDonorId() {
      return donorId;
    }

    public void setDonorId(Long donorId) {
      this.donorId = donorId;
    }

    public Long getReceiverId() {
      return receiverId;
    }

    public void setReceiverId(Long receiverId) {
      this.receiverId = receiverId;
    }

    public BigDecimal getAmount() {
      return amount;
    }

    public void setAmount(BigDecimal amount) {
      this.amount = amount;
    }

    public String getMessage() {
      return message;
    }

    public void setMessage(String message) {
      this.message = message;
    }
  }
}
