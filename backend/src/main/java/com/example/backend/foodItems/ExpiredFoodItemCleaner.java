package com.example.backend.foodItems;

import java.util.Date;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Component
public class ExpiredFoodItemCleaner implements CommandLineRunner {

    private final FoodItemRepository foodItemRepository;
    private final FoodItemSearchService searchService; // For Elasticsearch sync
    private static final Logger log = LoggerFactory.getLogger(ExpiredFoodItemCleaner.class);

    
    public ExpiredFoodItemCleaner(
            FoodItemRepository foodItemRepository,
            FoodItemSearchService searchService) {
        this.foodItemRepository = foodItemRepository;
        this.searchService = searchService;
    }
    
    @Scheduled(cron = "0 0 1 * * ?") // Runs at 1:00 AM every day
    public void removeExpiredItems() {
        Date currentDate = new Date();
        List<FoodItems> expiredItems = foodItemRepository.findByExpiryDateBefore(currentDate);
        
        // Delete from PostgreSQL
        foodItemRepository.deleteByExpiryDateBefore(currentDate);
        
        // Also remove from Elasticsearch index if you're using it
        // This ensures your search index stays in sync
        for (FoodItems item : expiredItems) {
            searchService.deleteFromIndex(item.getId());
        }
        
        log.info("Removed {} expired food items", expiredItems.size());
    }

    public void manuallyRemoveExpiredItems() {
        removeExpiredItems();
    }

    @Override
    public void run(String... args) {
        // Run your cleanup logic here
        Date currentDate = new Date();
        foodItemRepository.deleteByExpiryDateBefore(currentDate);
        System.out.println("Startup cleanup: Removed expired food items at " + new Date());
    }
}
