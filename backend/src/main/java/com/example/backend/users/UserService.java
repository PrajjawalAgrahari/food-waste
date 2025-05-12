package com.example.backend.users;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void register(User user) {
        String hashedPassword = BCrypt.hashpw(user.getPasswordHash(), BCrypt.gensalt());
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);
    }

    public boolean login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email);
//        System.out.println(user);
        if (user == null) {
            return false; // User not found
        }
        System.out.println(user.getPasswordHash());
        System.out.println(rawPassword);
        // Check if the raw password matches the hashed password
        return BCrypt.checkpw(rawPassword, user.getPasswordHash());
    }
}
