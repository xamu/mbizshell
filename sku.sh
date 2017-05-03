#!/bin/bash

source ./functions.sh

# PREPARE THE FILES
mongo export_content.js
mongo export_va.js

mongoexport --db catalogues --collection exportAllSkuContent --type=csv --fields no,sku,title,brand,category,created,first_visible_date,status,price_unit,item_type,product_weight,product_length,product_width,product_height,package_weight,package_length,package_width,package_height,image,vendor_sku_status,catalog_sku_status,discontinued,unspsc,unspsc_category,manufacturer_id,catalog_type,web_visibility --out content.csv

mongoexport --db catalogues --collection exportAllSkuVa --type=csv --fields No,Vendor,BusinessName,SKU,VendorSKU,CategoryID,ProductName,Stock,price1,price2,price3,UploadDate,FirstVisibleDate,VendorSKUStatus,CatalogSKUStatus  --out va.csv


s3publicurl="https://s3-ap-southeast-1.amazonaws.com/mbiz-images"
now=$(date +"%Y-%m-%d")
path="./files"
file_va=$path"/va_"$now"_"$(( $RANDOM % 1000000 ))".zip"
file_content=$path"/content_"$now"_"$(( $RANDOM % 1000000 ))".zip"
password="MBIZdata21"

zip -P $password $file_va "va.csv"
zip -P $password $file_content "content.csv"

rm content.csv
rm va.csv


# # UPLOAD TO S3 & insert to file list in mongo
for file in "$path"/*; do	
	filename=${file##*/}
	prev2=${filename:0:2}
	if [ $prev2 == 'va' ];
	then
		type="va"
		paths3="/reports/sku/va/"
	else
		type="content"
		paths3="/reports/sku/content/"
	fi

	putS3 "$path" "${file##*/}" "$paths3"
	mongo --nodb --quiet --eval "var name='${file##*/}', type='$type', date='$now', path='$s3publicurl$paths3'" insert_list.js
	
	rm "$path/${file##*/}"
done