import pandas as pd
import json
import os

excel_path = r"C:\Users\ahmad\Downloads\Rincian_Biaya_Shopee_Per_Kategori.xlsx"
df_star = pd.read_excel(excel_path, sheet_name='Non-Star & Star')
df_mall = pd.read_excel(excel_path, sheet_name='Shopee Mall')

# Clean columns and strings
for df in [df_star, df_mall]:
    df.columns = [c.strip() for c in df.columns]
    for col in ['Kategori', 'Sub Kategori', 'Jenis Produk']:
        df[col] = df[col].astype(str).str.strip().str.replace(r'\s+', ' ', regex=True)

# Merge
merged = pd.merge(df_star, df_mall, on=['Kategori', 'Sub Kategori', 'Jenis Produk'], how='outer', suffixes=('_star', '_mall'))

# Fill missing rates
def get_rates(row):
    star_raw = row['Biaya Admin (Angka)_star']
    mall_raw = row['Biaya Admin (Angka)_mall']
    
    if pd.notnull(star_raw):
        star_rate = round(star_raw * 100, 2)
    else:
        star_rate = None
        
    if pd.notnull(mall_raw):
        mall_rate = round(mall_raw * 100, 2)
    else:
        mall_rate = None
        
    # Fallback mappings
    if star_rate is None and mall_rate is not None:
        star_rate = round(max(2.5, mall_rate - 0.95), 2)
    if mall_rate is None and star_rate is not None:
        mall_rate = round(star_rate + 0.95, 2)
        
    return pd.Series([star_rate, mall_rate])

merged[['Star Rate', 'Mall Rate']] = merged.apply(get_rates, axis=1)

# Keep only the necessary columns
output_df = merged[['Kategori', 'Sub Kategori', 'Jenis Produk', 'Star Rate', 'Mall Rate']].copy()

# Output JSON structure
records = output_df.to_dict(orient='records')

# Output path
os.makedirs("src/utils", exist_ok=True)
json_path = "src/utils/shopee_categories.json"
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {json_path} with {len(records)} categories.")
