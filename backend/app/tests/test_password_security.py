"""
Tests for secure password handling functionality.

This test module verifies that password hashing and verification work correctly,
ensuring that passwords are stored securely and can be properly validated.
"""

import pytest
from app.utils.password_utils import hash_password, verify_password


class TestPasswordHashing:
    """Test password hashing and verification functionality."""
    
    def test_hash_password_creates_different_hashes(self):
        """Test that hashing the same password multiple times creates different hashes due to salt."""
        password = "testsecretpassword123"
        
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # Hashes should be different due to random salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True
    
    def test_verify_password_correct(self):
        """Test that correct password verification works."""
        password = "mypassword123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test that incorrect password verification fails."""
        password = "mypassword123"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_malformed_hash(self):
        """Test that malformed hashes are handled gracefully."""
        password = "mypassword123"
        malformed_hash = "not_a_real_hash"
        
        # Should return False, not raise an exception
        assert verify_password(password, malformed_hash) is False
    
    def test_hash_format(self):
        """Test that hashed passwords have the expected bcrypt format."""
        password = "testpassword"
        hashed = hash_password(password)
        
        # bcrypt hashes start with $2b$ and are 60 characters long
        assert hashed.startswith('$2b$')
        assert len(hashed) == 60
    
    def test_empty_password_handling(self):
        """Test handling of empty passwords."""
        empty_password = ""
        hashed = hash_password(empty_password)
        
        assert verify_password(empty_password, hashed) is True
        assert verify_password("notempty", hashed) is False


class TestPasswordIntegration:
    """Integration tests for password functionality."""
    
    def test_full_password_workflow(self):
        """Test complete password workflow: hash -> store -> verify."""
        original_password = "UserPassword123!"
        
        # Step 1: Hash the password (as done during registration)
        hashed_password = hash_password(original_password)
        
        # Step 2: Store in database (simulated)
        stored_hash = hashed_password
        
        # Step 3: Verify during login
        login_success = verify_password(original_password, stored_hash)
        login_failure = verify_password("WrongPassword", stored_hash)
        
        assert login_success is True
        assert login_failure is False
    
    def test_password_case_sensitivity(self):
        """Test that password verification is case sensitive."""
        password = "MyPassword"
        hashed = hash_password(password)
        
        assert verify_password("MyPassword", hashed) is True
        assert verify_password("mypassword", hashed) is False
        assert verify_password("MYPASSWORD", hashed) is False


if __name__ == "__main__":
    # Run tests if script is executed directly
    pytest.main([__file__, "-v"])
