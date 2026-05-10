import re
import math

def extract_features(key: str, value: str) -> list:
    """
    Extracts a deterministic numeric feature vector from a JSON key and sample value.
    Returns a list of floats/ints.
    """
    key_str = str(key)
    key_lower = key_str.lower()
    value_str = str(value)
    value_lower = value_str.lower()

    # --- Phase 3 / Step 2: Key-Based Features ---
    features = [
        1.0 if 'email' in key_lower or 'mail' in key_lower else 0.0,      # contains_email
        1.0 if 'id' in key_lower or 'uuid' in key_lower else 0.0,        # contains_id
        1.0 if any(x in key_lower for x in ['date', 'time', 'at']) else 0.0, # contains_date
        1.0 if 'url' in key_lower or 'link' in key_lower else 0.0,       # contains_url
        1.0 if 'uuid' in key_lower or 'guid' in key_lower else 0.0,      # contains_uuid
        1.0 if 'name' in key_lower else 0.0,                             # contains_name
        1.0 if 'user' in key_lower else 0.0,                             # contains_user
        float(len(key_str)),                                             # key_length
        1.0 if '_' in key_str and key_str.islower() else 0.0,           # snake_case
        1.0 if key_str != key_lower and key_str != key_str.upper() and '_' not in key_str else 0.0, # camel_case
        sum(1 for c in key_str if c.isupper()) / max(1, len(key_str))    # uppercase_ratio
    ]

    # --- Phase 3 / Step 3: Value-Based Features ---
    # is_number: handles integers and simple floats
    is_num = 1.0 if value_str.replace('.', '', 1).replace('-', '', 1).isdigit() else 0.0
    
    # is_boolean: matches typical boolean representations
    is_bool = 1.0 if value_lower in ['true', 'false', '1', '0'] else 0.0

    # string_length
    val_len = float(len(value_str))

    # digit_ratio
    digit_count = sum(1 for c in value_str if c.isdigit())
    digit_ratio = digit_count / max(1, val_len)

    # special_character_count
    special_count = sum(1 for c in value_str if not c.isalnum() and not c.isspace())

    # Regex matches (Standard stable patterns)
    email_regex = r'^[\w\.\+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$'
    uuid_regex = r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    date_regex = r'^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$'
    url_regex = r'^https?://[^\s/$.?#].[^\s]*$'

    features.extend([
        is_num,                                                          # is_number
        is_bool,                                                         # is_boolean
        val_len,                                                         # string_length
        digit_ratio,                                                     # digit_ratio
        float(special_count),                                            # special_character_count
        1.0 if re.match(email_regex, value_str) else 0.0,               # regex_email_match
        1.0 if re.match(uuid_regex, value_str) else 0.0,                # regex_uuid_match
        1.0 if re.match(date_regex, value_str) else 0.0,                # regex_date_match
        1.0 if re.match(url_regex, value_str) else 0.0,                 # regex_url_match
        1.0 if '-' in value_str else 0.0,                                # contains_hyphen
        1.0 if '@' in value_str else 0.0,                                # contains_at_symbol
        1.0 if '.' in value_str else 0.0                                 # contains_dot
    ])

    # --- Phase 3 / Step 4: Validation Helpers ---
    # Ensure no NaN or infinite values
    return [0.0 if math.isnan(x) or math.isinf(x) else float(x) for x in features]

def get_feature_names() -> list:
    return [
        'contains_email', 'contains_id', 'contains_date', 'contains_url', 'contains_uuid',
        'contains_name', 'contains_user', 'key_length', 'snake_case', 'camel_case', 'uppercase_ratio',
        'is_number', 'is_boolean', 'string_length', 'digit_ratio', 'special_character_count',
        'regex_email_match', 'regex_uuid_match', 'regex_date_match', 'regex_url_match',
        'contains_hyphen', 'contains_at_symbol', 'contains_dot'
    ]
