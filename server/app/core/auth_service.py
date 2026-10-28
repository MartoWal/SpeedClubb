"""
Authentication & Cryptography Service for SpeedClub.
Uses PBKDF2-HMAC-SHA256 with cryptographically secure random salt (secrets).
No complex native compilation required - uses Python standard library.
"""

import hashlib
import hmac
import secrets


def hash_password(password: str) -> str:
    """Hashes a plain password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    salt = secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${derived}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored salt$hash string using constant-time comparison."""
    if not hashed_password or '$' not in hashed_password:
        return False
    try:
        salt, expected_hash = hashed_password.split('$', 1)
        recalculated = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(recalculated, expected_hash)
    except Exception:
        return False
