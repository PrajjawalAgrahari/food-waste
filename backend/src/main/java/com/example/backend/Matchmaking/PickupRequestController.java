package com.example.backend.Matchmaking;

import com.example.backend.foodItems.FoodItemRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class PickupRequestController {

  private final FoodItemRepository foodItemRepository;
  private final PickupRequestRepository pickupRequestRepository;

  @Autowired
  public PickupRequestController(
    PickupRequestRepository pickupRequestRepository,
    FoodItemRepository foodItemRepository
  ) {
    this.foodItemRepository = foodItemRepository;
    this.pickupRequestRepository = pickupRequestRepository;
  }

  @PostMapping("/pickup-requests")
  public ResponseEntity<?> createPickupRequest(
    @RequestBody PickupRequestDTO requestDTO
  ) {
    String deliveryNumber = generateUniqueDeliveryNumber();

    try {
      List<PickupRequest> createdRequests = requestDTO
        .getItems()
        .stream()
        .map(item -> {
          PickupRequest pickupRequest = new PickupRequest();
          pickupRequest.setReceiverId(requestDTO.getReceiverId());
          pickupRequest.setDonorId(requestDTO.getDonorId());
          pickupRequest.setFoodItemId(item.getItemId());
          pickupRequest.setQuantity(item.getQuantity());
          pickupRequest.setPickupDate(
            LocalDate.parse(requestDTO.getPickupDate())
          );
          pickupRequest.setPickupTime(
            LocalTime.parse(requestDTO.getPickupTime())
          );
          pickupRequest.setStatus("PENDING");
          pickupRequest.setDeliveryNumber(deliveryNumber);
          foodItemRepository.reduceQuantityById(
            item.getItemId(),
            item.getQuantity()
          );
          return pickupRequestRepository.save(pickupRequest);
        })
        .collect(Collectors.toList());

      return ResponseEntity.ok(new PickupRequestResponse(createdRequests));
    } catch (Exception e) {
      return ResponseEntity
        .badRequest()
        .body("Failed to create pickup request: " + e.getMessage());
    }
  }

  @GetMapping("/pickup-requests/donor/{donorId}")
  public ResponseEntity<?> getPickupRequestsByDonorId(
    @PathVariable Long donorId
  ) {
    try {
      List<PickupRequest> requests = pickupRequestRepository.findByDonorId(
        donorId
      );
      return ResponseEntity.ok(new PickupRequestResponse(requests));
    } catch (Exception e) {
      return ResponseEntity
        .badRequest()
        .body("Failed to retrieve pickup requests: " + e.getMessage());
    }
  }

  @GetMapping("/pickup-requests/receiver/{receiverId}")
  public ResponseEntity<?> getPickupRequestsByReceiverId(
    @PathVariable Long receiverId
  ) {
    try {
      List<PickupRequest> requests = pickupRequestRepository.findByReceiverId(
        receiverId
      );
      return ResponseEntity.ok(new PickupRequestResponse(requests));
    } catch (Exception e) {
      return ResponseEntity
        .badRequest()
        .body("Failed to retrieve pickup requests: " + e.getMessage());
    }
  }

  @PatchMapping("/pickup-requests/delivery-number/{deliveryNumber}/status")
  @Transactional
  public ResponseEntity<?> updateDeliveryStatus(
    @PathVariable String deliveryNumber,
    @RequestBody StatusDTO statusUpdate
  ) {
    List<PickupRequest> requests = pickupRequestRepository.findByDeliveryNumber(
      deliveryNumber
    );
    if (requests.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    for (PickupRequest req : requests) {
      System.out.println(statusUpdate.getStatus());
      if (statusUpdate.getStatus().equals("CANCELLED")) {
        foodItemRepository.increaseQuantityById(
          req.getFoodItemId(),
          req.getQuantity()
        );
        pickupRequestRepository.deleteById(req.getId());
      } else {
        pickupRequestRepository.deleteById(req.getId());
        foodItemRepository.deleteIfZeroQuantity(req.getFoodItemId());
      }
    }
    return ResponseEntity.ok().build();
  }

  private String generateUniqueDeliveryNumber() {
    // Format: DEL-YYYYMMDD-XXXXXX where XXXXXX is a random number
    LocalDate today = LocalDate.now();
    String datePart = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    String randomPart = String.format(
      "%06d",
      ThreadLocalRandom.current().nextInt(1, 1000000)
    );
    return "DEL-" + datePart + "-" + randomPart;
  }
}

/**
 * Data Transfer Object for pickup requests.
 */

class StatusDTO {

  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}

class PickupRequestDTO {

  private Long receiverId;
  private Long donorId;
  private String pickupDate;
  private String pickupTime;
  private String deliveryNumber;
  private List<PickupItemDTO> items;

  // Getters and setters
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

  public String getPickupDate() {
    return pickupDate;
  }

  public String getDeliveryNumber() {
    return deliveryNumber;
  }

  public void setDeliveryNumber(String deliveryNumber) {
    this.deliveryNumber = deliveryNumber;
  }

  public void setPickupDate(String pickupDate) {
    this.pickupDate = pickupDate;
  }

  public String getPickupTime() {
    return pickupTime;
  }

  public void setPickupTime(String pickupTime) {
    this.pickupTime = pickupTime;
  }

  public List<PickupItemDTO> getItems() {
    return items;
  }

  public void setItems(List<PickupItemDTO> items) {
    this.items = items;
  }
}

/**
 * Data Transfer Object for pickup items.
 */
class PickupItemDTO {

  private Long itemId;
  private Integer quantity;

  // Getters and setters
  public Long getItemId() {
    return itemId;
  }

  public void setItemId(Long itemId) {
    this.itemId = itemId;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }
}

/**
 * Data Transfer Object for status updates.
 */
class StatusUpdateDTO {

  private String status;

  // Getters and setters
  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}

/**
 * Response object for pickup requests.
 */
class PickupRequestResponse {

  private List<PickupRequest> requests;

  public PickupRequestResponse(List<PickupRequest> requests) {
    this.requests = requests;
  }

  public List<PickupRequest> getRequests() {
    return requests;
  }

  public void setRequests(List<PickupRequest> requests) {
    this.requests = requests;
  }
}
