/*
 -- BORIS
 -- fields no,sku,title,brand,category,image,created,status
*/

conn = new Mongo();
db = conn.getDB("catalogues");

db.exportAllSkuContent.drop();

cursor = db.sku.find("",{_id:1, title:1, brand:1, category:1, images:1, created:1,shortDescription:1,description:1,feature:1,specification:1,shippingDetails:1,priceRules:1,priceUnit:1,itemType:1,meta_description:1,meta_title:1,meta_keywords:1,discontinued:1,unspsc_code:1,manufactureId:1,catalog_type:1});
var result = [];
var no =1;
while(cursor.hasNext()){
	var item = cursor.next();

	// get first date visible
	firstinventory = db.inventories.find({"sku":item._id}).sort({_id: -1}).limit(1);
	if(firstinventory.hasNext()) {
		firstItem = firstinventory.next();
		first_visible_date = firstItem.created;
	} else {
		first_visible_date = '';
	}

	//Run through inventories
	// inventories = db.inventories.find({"sku":item._id}, {stock:1, enabled:1});
	inventories = db.inventories.find({"sku":item._id, "enabled":1, "stock":{$gt:0}});

	//Run through category_lkpp
	category = db.category_lkpp.findOne({"mbiz_id":item.category[0]});

	var stock = 0;
	var status = 0;
	var enabled = 0;
	var web_visibility = "Not Live";

	while(inventories.hasNext()){
		web_visibility = "Live";
		invItem = inventories.next();

		//Sum total stock
		stock+= invItem.stock;

		//Get status
		enabled+= invItem.enabled;
	}
	if(stock || enabled){
		status = 1;
	}

	db.exportAllSkuContent.insert({
		"no":no,
		"sku": item._id,
		"title": item.title,
		"brand": item.brand,
		"category": item.category[0],
		"image": item.images[0],
		"created": item.created,
		"first_visible_date":first_visible_date,
		"status": (status ? "active" : "not active"),
		"shortDescription" : item.shortDescription,
		"description" : item.description,
		"feature" : item.feature,
		"specification" : item.specification,
//		"product_dimension" : item.
		"product_width" : item.shippingDetails.width,
		"product_height" : item.shippingDetails.height,
		"product_length" : item.shippingDetails.length,
		"product_weight" : item.shippingDetails.weight,
		"package_length" : item.shippingDetails.package ? item.shippingDetails.package.length : 0,
		"package_width"  : item.shippingDetails.package ? item.shippingDetails.package.width : 0,
		"package_height" : item.shippingDetails.package ? item.shippingDetails.package.height : 0,
		"package_weight" : item.shippingDetails.package ? item.shippingDetails.package.weight : 0,
		 "price1_from"    : item.priceRules.price1.from,
		 "price1_to"      : item.priceRules.price1.to,
		 "price2_from"    : item.priceRules.price2.from,
		 "price2_to"      : item.priceRules.price2.to,
		 "price3_from"    : item.priceRules.price3.from,
		 "price3_to"      : item.priceRules.price3.to,
		 "price_unit" 	  : item.priceUnit,
		 "item_type"      : item.itemType,
		 "meta_title"	  : item.meta_title,
		 "meta_description" : item.meta_description,
		 "meta_keywords"  : item.meta_keywords,
		"vendor_sku_status" : (enabled ? "Enable" : "Disable"),
		"catalog_sku_status" : (status ? "Active" : "Non Active"),
		"discontinued" : (item.discontinued == 1 ? "Discontinued":""),
		"unspsc" : item.unspsc_code,
		"unspsc_category" : category? category.unspsc : '',
		"manufacturer_id": item.manufactureId,
		"catalog_type" : item.catalog_type,
		"stock" : stock,
		"web_visibility" : web_visibility
		//"status": item.enabled
	});
	no++;
}