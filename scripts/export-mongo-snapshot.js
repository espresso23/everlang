// Run using mongosh against the explicitly selected SOURCE database.
// Redirect stdout to a private file, never commit the exported user data.
const snapshot = {};
for (const name of db.getCollectionNames().sort()) {
  if (!name.startsWith("system.")) snapshot[name] = db.getCollection(name).find().toArray();
}
print(EJSON.stringify(snapshot, null, 0, { relaxed: true }));
