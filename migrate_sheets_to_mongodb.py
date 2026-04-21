#!/usr/bin/env python3
"""
Google Sheets to MongoDB Migration Script
Converts Army Structure data from Google Sheets to MongoDB collections

Usage: python migrate_sheets_to_mongodb.py
Requires: pip install pymongo pandas requests python-dotenv
"""

import os
import sys
import pandas as pd
import requests
from io import StringIO
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, DuplicateKeyError
from datetime import datetime
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
SHEET_ID = '1Jbr9BJOO6-gsrK82JQNd-RCNetFmegSq4EjuO0TR3cM'
SHEET_GID = '46911911'
CSV_URL = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={SHEET_GID}'

def download_sheet():
    """Download CSV from Google Sheets"""
    print('📥 Downloading Google Sheets CSV...')
    try:
        response = requests.get(CSV_URL, timeout=30)
        response.encoding = 'utf-8'
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f'❌ Download Error: {e}')
        raise

def parse_csv(csv_text):
    """Parse CSV and return DataFrame"""
    print('📊 Parsing CSV data...')
    try:
        df = pd.read_csv(StringIO(csv_text))
        print(f'✅ Parsed {len(df)} records')
        return df
    except Exception as e:
        print(f'❌ CSV Parse Error: {e}')
        raise

def transform_data(df):
    """Transform DataFrame to MongoDB documents"""
    print(f'🔄 Transforming {len(df)} records...')
    
    documents = []
    
    for idx, row in df.iterrows():
        # Skip empty rows
        if pd.isna(row.get('ปฏิบัติการหน้างาน (Level 4)')):
            continue
        
        try:
            general = int(row.get('นายพล', 0)) if pd.notna(row.get('นายพล')) else 0
            colonel = int(row.get('น.', 0)) if pd.notna(row.get('น.')) else 0
            major = int(row.get('ส.', 0)) if pd.notna(row.get('ส.')) else 0
            soldier = int(row.get('พลฯ', 0)) if pd.notna(row.get('พลฯ')) else 0
            total = int(row.get('รวม', 0)) if pd.notna(row.get('รวม')) else 0
            
            doc = {
                'plan': str(row.get('การจัดแผน', '')).strip(),
                'level0': str(row.get('ระดับยุทธศาสตร์ (Level 0)', '')).strip(),
                'level1': str(row.get('การจัดกำลัง (Level 1)', '')).strip(),
                'level2': str(row.get('ระดับยุทธการ (Level 2)', '')).strip(),
                'level3': str(row.get('ระดับยุทธวิธี (Level 3)', '')).strip(),
                'level4': str(row.get('ปฏิบัติการหน้างาน (Level 4)', '')).strip(),
                'name': str(row.get('ปฏิบัติการหน้างาน (Level 4)', '')).strip(),
                'general': general,
                'colonel': colonel,
                'major': major,
                'soldier': soldier,
                'total': total,
                'checkList': str(row.get('เช็ค List', '')).upper() == 'TRUE',
                'note': str(row.get('หมายเหตุ', '')).strip(),
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            documents.append(doc)
        except Exception as e:
            print(f'⚠️  Error processing row {idx}: {e}')
            continue
    
    print(f'✅ Transformed {len(documents)} valid documents')
    return documents

def connect_mongodb():
    """Connect to MongoDB"""
    print('🔌 Connecting to MongoDB...')
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print('✅ Connected to MongoDB')
        return client
    except ServerSelectionTimeoutError as e:
        print(f'❌ MongoDB Connection Error: {e}')
        raise
    except Exception as e:
        print(f'❌ Connection Error: {e}')
        raise

def import_to_mongodb(documents, client):
    """Import documents to MongoDB"""
    try:
        db = client.get_database()
        collection = db['army_structures']
        
        print('🗑️  Clearing existing data...')
        collection.delete_many({})
        
        print('💾 Importing data to MongoDB...')
        if documents:
            result = collection.insert_many(documents, ordered=False)
            print(f'✅ Successfully imported {len(result.inserted_ids)} documents')
        else:
            print('⚠️  No documents to import')
            return 0
        
        # Print statistics
        print('\n📈 Import Statistics:')
        print('─' * 60)
        
        stats = list(collection.aggregate([
            {
                '$group': {
                    '_id': '$plan',
                    'count': {'$sum': 1},
                    'totalPersonnel': {'$sum': '$total'}
                }
            },
            {'$sort': {'totalPersonnel': -1}}
        ]))
        
        for stat in stats:
            plan_name = stat['_id'] or 'Unknown'
            print(f'Plan: {plan_name}')
            print(f'  Records: {stat["count"]}, Total Personnel: {stat["totalPersonnel"]}')
        
        # Overall stats
        total_records = collection.count_documents({})
        total_personnel = sum(doc.get('total', 0) for doc in collection.find({}, {'total': 1}))
        print('\n' + '─' * 60)
        print(f'Total Records: {total_records}')
        print(f'Total Personnel: {total_personnel}')
        
        return len(result.inserted_ids)
    except Exception as e:
        print(f'❌ Import Error: {e}')
        raise

def main():
    print('🚀 Starting Google Sheets to MongoDB Migration')
    print('═' * 60)
    
    if not MONGODB_URI:
        print('❌ MONGODB_URI not found in .env')
        sys.exit(1)
    
    try:
        # Step 1: Download CSV
        csv_text = download_sheet()
        
        # Step 2: Parse CSV
        df = parse_csv(csv_text)
        
        # Step 3: Transform data
        documents = transform_data(df)
        
        # Step 4: Connect to MongoDB
        client = connect_mongodb()
        
        # Step 5: Import to MongoDB
        count = import_to_mongodb(documents, client)
        
        print('\n✨ Migration completed successfully!')
        print('═' * 60)
        
        client.close()
        
    except Exception as e:
        print(f'\n❌ Migration failed: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()
