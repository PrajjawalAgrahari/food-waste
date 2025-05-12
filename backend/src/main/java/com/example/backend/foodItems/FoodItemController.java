package com.example.backend.foodItems;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class FoodItemController {

  private final FoodItemRepository foodItemRepository;
  private final FoodItemService foodItemService;

  public FoodItemController(
    FoodItemRepository foodItemRepository,
    FoodItemService foodItemService
  ) {
    this.foodItemService = foodItemService;
    this.foodItemRepository = foodItemRepository;
  }

  @PostMapping("/add-items")
  public void addItems(@RequestBody FoodItems[] foodItems) {
    for (FoodItems foodItem : foodItems) {
      foodItemRepository.save(foodItem);
    }
    foodItemService.sendNotifications(foodItems);
  }

  @GetMapping("/items")
  public List<FoodItems> getAllItems() {
    return foodItemRepository.findAllWithNonZeroQuantity();
  }

  @GetMapping("/items/nearby")
  public List<FoodItems> getNearbyItems(
    @RequestParam double lat,
    @RequestParam double lng,
    @RequestParam int distance
  ) {
    return foodItemRepository.findItemsWithinDistance(lat, lng, distance);
  }

  @GetMapping("/items/{id}")
  public List<FoodItems> getItemByDonorId(@PathVariable Long id) {
    return foodItemRepository.findByDonorId(id);
  }
}
