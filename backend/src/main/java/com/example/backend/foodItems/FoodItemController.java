package com.example.backend.foodItems;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class FoodItemController {

  private final FoodItemRepository foodItemRepository;
  private final FoodItemService foodItemService;
  private final FoodItemSearchService searchService;

  public FoodItemController(
    FoodItemRepository foodItemRepository,
    FoodItemService foodItemService,
    FoodItemSearchService searchService
  ) {
    this.foodItemService = foodItemService;
    this.foodItemRepository = foodItemRepository;
    this.searchService = searchService;
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

  @GetMapping("/items/combined-search")
  public List<FoodItems> searchWithCombinedFilters(
    @RequestParam(required = false) String query,
    @RequestParam(
      required = false,
      defaultValue = "false"
    ) boolean expiringSoon,
    @RequestParam(required = false) Long donorId
  ) {
    return searchService.searchWithCombinedFilters(
      query,
      expiringSoon,
      donorId
    );
  }

  @GetMapping("/items/suggest")
  public List<String> getSuggestions(@RequestParam String prefix) {
    return searchService.getSuggestions(prefix);
  }

  @GetMapping("/items/fuzzy-search")
  public List<FoodItems> fuzzySearch(@RequestParam String query) {
    return searchService.searchWithFuzzy(query);
  }

  @PostMapping("/items/index")
  public void indexAllItems() {
    searchService.indexAllFoodItems();
  }
}
