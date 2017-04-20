/*
 -- YANUAR
 -- fields No,Vendor,BusinessName,SKU,VendorSKU,CategoryID,ProductName,Stock,UploadDate,FirstVisibleDate,VendorSKUStatus,CatalogSKUStatus
*/

// conn = new Mongo("192.168.1.37:27017");
conn = new Mongo();
db = conn.getDB("catalogues");

db.exportAllSkuVa.drop();

cursor = db.sku.find("",{_id:1, title:1, category:1, created:1});
var result = [];
var no =1;
while(cursor.hasNext()){
	var item = cursor.next();

	//Run through inventories
	inventories = db.inventories.find({"sku":item._id});

	var stock = 0;
	var status = 0;
	var enabled = 0;
	while(inventories.hasNext()){
		invItem = inventories.next();

		status = 0;

		inventoriesCheckStatus = db.inventories.find({"sku":item._id,"enabled":1,"stock": { $gt: 0 } });
		if(inventoriesCheckStatus.count() > 0 ){
			status = 1;
		}
		// if(stock>0 && enabled==1){
		// 	status = 1;
		// }
		db.exportAllSkuVa.insert({
			"No":no,
			"Vendor": invItem.sellerId,
			"BusinessName": invItem.sellerName,
			"SKU": item._id,
			"VendorSKU": invItem.sellerSku,
			"CategoryID": item.category[0],
			"ProductName": item.title,
			"Stock": invItem.stock,
			"price1":invItem.price1,
			"price2":invItem.price2,
			"price3":invItem.price3,
			"UploadDate": item.created,
			"FirstVisibleDate" : item.created,
			"VendorSKUStatus" : (invItem.enabled == 1 ? "Enable" : "Disable"),
			"CatalogSKUStatus" : (status == 1 ? "Active" : "Non Active")
		});
		no++;
	}
}