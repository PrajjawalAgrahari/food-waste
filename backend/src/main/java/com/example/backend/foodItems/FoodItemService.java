package com.example.backend.foodItems;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.users.User;
import com.example.backend.users.UserRepository;

@Service
public class FoodItemService {

    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    public FoodItemService(UserRepository userRepository, EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
        this.userRepository = userRepository;
    }
    public void sendNotifications(FoodItems[] foodItems) {
        FoodItems foodItem = foodItems[0];
        double lat1 = foodItem.getPickupLatitude().doubleValue();
        double lon1 = foodItem.getPickupLongitude().doubleValue();

        List<User> users = userRepository.findByRole("RECEIVER");

        // Create a message with all the food items
        StringBuilder message = new StringBuilder("Available food items:\n");
        for (FoodItems item : foodItems) {
            message.append(item.getName()).append("\n");
        }
        message.append("Pickup location: ").append(lat1).append(", ").append(lon1).append("\n");
        message.append("Distance: 5 km\n");
        message.append("Please respond if you are interested.");

        for (User user : users) {
            double lat2 = user.getHomeLat().doubleValue();
            double lon2 = user.getHomeLon().doubleValue();
            double distance = GeoUtils.distanceKm(lat1, lon1, lat2, lon2);
            if (distance <= 5) {
                emailNotificationService.sendSimpleMessage("agrahariprajjawal5@gmail.com", "Food Item Available", message.toString());
            }
        }
    }
}
