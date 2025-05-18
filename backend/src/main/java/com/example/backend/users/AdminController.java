package com.example.backend.users;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.foodItems.ExpiredFoodItemCleaner;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final ExpiredFoodItemCleaner cleaner;
    
    public AdminController(ExpiredFoodItemCleaner cleaner) {
        this.cleaner = cleaner;
    }
    
    @PostMapping("/remove-expired-items")
    public ResponseEntity<String> triggerExpiredItemsCleanup() {
        cleaner.manuallyRemoveExpiredItems();
        return ResponseEntity.ok("Expired items cleanup triggered successfully");
    }
}
