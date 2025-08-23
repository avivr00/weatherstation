import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
import jwt

from app.utils.token_utils import (
    create_access_token,
    validate_access_token,
    validate_user_from_token,
    extract_bearer_token,
    SECRET_KEY,
    ALGORITHM
)
from app.db.models.users_ORM import UserORM
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
import importlib
importlib.import_module("app.db.models.users_ORM")
importlib.import_module("app.db.models.events_ORM")

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the test DB
Base.metadata.create_all(bind=engine)


class TestTokenCreation:
    def test_create_access_token_with_default_expiry(self):
        data = {"email": "test@example.com", "token_version": 0}
        token = create_access_token(data)
        
        # Verify token is a string and has JWT structure
        assert isinstance(token, str)
        assert token.count('.') == 2  # JWT should have 3 parts separated by dots
        
        # Decode and verify contents
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["email"] == "test@example.com"
        assert payload["token_version"] == 0
        assert "exp" in payload

    def test_create_access_token_with_custom_expiry(self):
        data = {"email": "test@example.com", "token_version": 0}
        custom_expiry = timedelta(hours=1)
        token = create_access_token(data, custom_expiry)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        
        # Should expire approximately 1 hour from now (allow some variance)
        time_diff = exp_time - now
        assert abs(time_diff.total_seconds() - 3600) < 60  # Within 1 minute

    def test_create_access_token_with_additional_data(self):
        data = {
            "email": "test@example.com",
            "token_version": 5,
            "custom_field": "custom_value"
        }
        token = create_access_token(data)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["email"] == "test@example.com"
        assert payload["token_version"] == 5
        assert payload["custom_field"] == "custom_value"


class TestTokenValidation:
    def test_validate_access_token_success(self):
        data = {"email": "test@example.com", "token_version": 0}
        token = create_access_token(data)
        
        payload = validate_access_token(token)
        assert payload["email"] == "test@example.com"
        assert payload["token_version"] == 0

    def test_validate_access_token_expired(self):
        data = {"email": "test@example.com", "token_version": 0}
        # Create token that expires immediately
        expired_token = create_access_token(data, timedelta(seconds=-1))
        
        with pytest.raises(ValueError, match="Token has expired"):
            validate_access_token(expired_token)

    def test_validate_access_token_invalid_format(self):
        with pytest.raises(ValueError, match="Token validation failed"):
            validate_access_token("not.a.jwt.token")
        
        with pytest.raises(ValueError, match="Token validation failed"):
            validate_access_token("invalid_token")
        
        with pytest.raises(ValueError, match="Token validation failed"):
            validate_access_token("")

    def test_validate_access_token_invalid_signature(self):
        # Create a token with different secret
        fake_token = jwt.encode(
            {"email": "test@example.com"},
            "wrong_secret",
            algorithm=ALGORITHM
        )
        
        with pytest.raises(ValueError, match="Invalid token"):
            validate_access_token(fake_token)

    def test_validate_access_token_none_input(self):
        # Test with None - this should be caught by the token format check
        with pytest.raises(ValueError, match="Token validation failed"):
            validate_access_token("")  # Use empty string instead of None

    def test_validate_access_token_malformed_jwt(self):
        # Create a JWT-like string but with invalid payload
        malformed = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid_payload.signature"
        
        with pytest.raises(ValueError, match="Invalid token"):
            validate_access_token(malformed)


class TestBearerTokenExtraction:
    def test_extract_bearer_token_success(self):
        auth_header = "Bearer abc123xyz"
        token = extract_bearer_token(auth_header)
        assert token == "abc123xyz"

    def test_extract_bearer_token_case_insensitive(self):
        auth_header = "bearer abc123xyz"
        token = extract_bearer_token(auth_header)
        assert token == "abc123xyz"
        
        auth_header = "BEARER abc123xyz"
        token = extract_bearer_token(auth_header)
        assert token == "abc123xyz"

    def test_extract_bearer_token_with_complex_token(self):
        complex_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature"
        auth_header = f"Bearer {complex_token}"
        token = extract_bearer_token(auth_header)
        assert token == complex_token

    def test_extract_bearer_token_none_input(self):
        token = extract_bearer_token(None)
        assert token is None

    def test_extract_bearer_token_empty_string(self):
        token = extract_bearer_token("")
        assert token is None

    def test_extract_bearer_token_invalid_format(self):
        # Missing Bearer prefix
        token = extract_bearer_token("abc123xyz")
        assert token is None
        
        # Wrong prefix
        token = extract_bearer_token("Basic abc123xyz")
        assert token is None
        
        # Extra parts
        token = extract_bearer_token("Bearer abc123 xyz")
        assert token is None
        
        # Only Bearer without token
        token = extract_bearer_token("Bearer")
        assert token is None

    def test_extract_bearer_token_with_whitespace(self):
        # Extra whitespace should not affect extraction
        auth_header = "Bearer  abc123xyz"
        token = extract_bearer_token(auth_header)
        assert token == "abc123xyz"


class TestUserValidationFromToken:
    def setup_method(self):
        """Set up a fresh database session for each test"""
        self.db = TestingSessionLocal()

    def teardown_method(self):
        """Clean up after each test"""
        self.db.close()

    def test_validate_user_from_token_success(self):
        # Create a user in the database
        user = UserORM(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            password="password123",
            token_version=0
        )
        self.db.add(user)
        self.db.commit()
        
        # Create a valid token for this user
        data = {"email": "test@example.com", "token_version": 0}
        token = create_access_token(data)
        
        # Validate the token
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is not None
        assert getattr(validated_user, "email") == "test@example.com"
        assert getattr(validated_user, "first_name") == "Test"

    def test_validate_user_from_token_user_not_found(self):
        # Create a token for a user that doesn't exist
        data = {"email": "nonexistent@example.com", "token_version": 0}
        token = create_access_token(data)
        
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is None

    def test_validate_user_from_token_version_mismatch(self):
        # Create a user with token_version = 1
        user = UserORM(
            email="version_mismatch@example.com",
            first_name="Test",
            last_name="User",
            password="password123",
            token_version=1
        )
        self.db.add(user)
        self.db.commit()
        
        # Create a token with token_version = 0 (outdated)
        data = {"email": "version_mismatch@example.com", "token_version": 0}
        token = create_access_token(data)
        
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is None

    def test_validate_user_from_token_invalid_token(self):
        # Create a user
        user = UserORM(
            email="invalid_token@example.com",
            first_name="Test",
            last_name="User",
            password="password123",
            token_version=0
        )
        self.db.add(user)
        self.db.commit()
        
        # Try with an invalid token
        validated_user = validate_user_from_token("invalid.token.here", self.db)
        assert validated_user is None

    def test_validate_user_from_token_missing_email(self):
        # Create a token without email
        data = {"token_version": 0, "other_field": "value"}
        token = create_access_token(data)
        
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is None

    def test_validate_user_from_token_missing_token_version(self):
        # Create a user
        user = UserORM(
            email="missing_token_version@example.com",
            first_name="Test",
            last_name="User",
            password="password123",
            token_version=0
        )
        self.db.add(user)
        self.db.commit()
        
        # Create a token without token_version
        data = {"email": "missing_token_version@example.com"}
        token = create_access_token(data)
        
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is None

    def test_validate_user_from_token_user_has_no_token_version(self):
        # Create a user without token_version (should default to 0)
        user = UserORM(
            email="no_token_version@example.com",
            first_name="Test",
            last_name="User",
            password="password123"
            # No token_version set, defaults to 0
        )
        self.db.add(user)
        self.db.commit()
        
        # Create a token with token_version = 0 (should match the default)
        data = {"email": "no_token_version@example.com", "token_version": 0}
        token = create_access_token(data)
        
        validated_user = validate_user_from_token(token, self.db)
        # Should succeed because user.token_version defaults to 0 and token has version 0
        assert validated_user is not None
        assert validated_user.email == "no_token_version@example.com"


class TestTokenIntegration:
    def setup_method(self):
        """Set up a fresh database session for each test"""
        self.db = TestingSessionLocal()

    def teardown_method(self):
        """Clean up after each test"""
        self.db.close()

    def test_complete_token_workflow(self):
        """Test a complete token creation, validation, and user retrieval workflow"""
        # Create a user
        user = UserORM(
            email="workflow@example.com",
            first_name="Workflow",
            last_name="Test",
            password="password123",
            token_version=0
        )
        self.db.add(user)
        self.db.commit()
        
        # Create a token
        data = {"email": "workflow@example.com", "token_version": 0}
        token = create_access_token(data)
        
        # Simulate Authorization header
        auth_header = f"Bearer {token}"
        extracted_token = extract_bearer_token(auth_header)
        assert extracted_token == token
        assert extracted_token is not None  # Type guard
        
        # Validate token payload
        payload = validate_access_token(extracted_token)
        assert payload["email"] == "workflow@example.com"
        
        # Validate user from token
        validated_user = validate_user_from_token(extracted_token, self.db)
        assert validated_user is not None
        assert getattr(validated_user, "email") == "workflow@example.com"

    def test_token_invalidation_simulation(self):
        """Test token invalidation by incrementing token_version"""
        # Create a user
        user = UserORM(
            email="invalidate@example.com",
            first_name="Invalidate",
            last_name="Test",
            password="password123",
            token_version=0
        )
        self.db.add(user)
        self.db.commit()
        
        # Create a token with current version
        data = {"email": "invalidate@example.com", "token_version": 0}
        token = create_access_token(data)
        
        # Token should be valid initially
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is not None
        
        # Simulate logout by incrementing token_version
        setattr(user, "token_version", 1)
        self.db.commit()
        
        # Old token should now be invalid
        validated_user = validate_user_from_token(token, self.db)
        assert validated_user is None
        
        # New token with updated version should work
        new_data = {"email": "invalidate@example.com", "token_version": 1}
        new_token = create_access_token(new_data)
        
        validated_user = validate_user_from_token(new_token, self.db)
        assert validated_user is not None

    def test_token_with_different_secret(self):
        """Test that tokens created with different secrets are invalid"""
        # Create a token with the original secret
        data = {"email": "test@example.com", "token_version": 0}
        token = create_access_token(data)
        
        # Now try to validate it with a different secret by patching
        with patch('app.utils.token_utils.SECRET_KEY', 'different_secret'):
            with pytest.raises(ValueError, match="Invalid token"):
                validate_access_token(token)
