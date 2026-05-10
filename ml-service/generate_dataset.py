import pandas as pd
import random
import uuid
import os
from faker import Faker

fake = Faker()

LABELS = ['email', 'uuid', 'date_iso', 'url', 'boolean', 'numeric_id', 'unknown']

def apply_noise(base_key: str) -> str:
    """Inject noise, casing variations, and abbreviations into keys."""
    transforms = [
        lambda k: k.lower(),
        lambda k: k.upper(),
        lambda k: k.title().replace('_', ''), # PascalCase
        lambda k: k.split('_')[0] + ''.join(x.title() for x in k.split('_')[1:]) if '_' in k else k, # camelCase
        lambda k: k.replace('_', '-'), # kebab-case
        lambda k: f"str_{k}",
        lambda k: f"val_{k}",
        lambda k: f"{k}_val",
        lambda k: k.replace('email', 'eml').replace('address', 'addr').replace('number', 'num'),
        lambda k: k[:-1] if random.random() < 0.1 and len(k) > 3 else k, # typos
    ]
    return random.choice(transforms)(base_key)

def generate_row():
    # 20-30% unknown distribution
    label = random.choices(LABELS, weights=[0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.28])[0]
    
    if label == 'email':
        key = apply_noise(random.choice(['email', 'user_email', 'contact_mail', 'email_address']))
        val = fake.email()
    elif label == 'uuid':
        key = apply_noise(random.choice(['id', 'uuid', 'guid', 'user_id', 'session_id']))
        val = str(uuid.uuid4())
    elif label == 'date_iso':
        key = apply_noise(random.choice(['created_at', 'updated_at', 'timestamp', 'date_of_birth']))
        val = fake.date_time().isoformat()
    elif label == 'url':
        key = apply_noise(random.choice(['url', 'website', 'avatar_url', 'link']))
        val = fake.url()
    elif label == 'boolean':
        key = apply_noise(random.choice(['is_active', 'enabled', 'verified', 'has_access']))
        val = random.choice(['true', 'false', '1', '0', 'True', 'False'])
    elif label == 'numeric_id':
        key = apply_noise(random.choice(['id', 'user_id', 'order_id', 'customer_id']))
        val = str(random.randint(1000, 999999))
    else: # unknown
        key = apply_noise(random.choice(['name', 'description', 'title', 'metadata', 'random_key']))
        val = random.choice([fake.name(), fake.sentence(), str(random.random()), "N/A", "unknown"])
        
    return {"key_name": key, "sample_value": str(val), "label": label}

if __name__ == "__main__":
    num_rows = random.randint(6000, 7500)
    data = [generate_row() for _ in range(num_rows)]
    df = pd.DataFrame(data)
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/dataset.csv', index=False)
    
    print(f"Dataset generated: {len(df)} rows.")
    print(df['label'].value_counts(normalize=True))
