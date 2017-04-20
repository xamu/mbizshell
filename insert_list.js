conn = new Mongo();
db = conn.getDB("catalogues");
db.createCollection("report_files");

db.report_files.insert({
	"Name":name,
	"Path":path,
	"Type":type,
	"Date":ISODate(date)
});