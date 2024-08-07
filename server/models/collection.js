import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: false },
  imageUrl: { type: String, required: false },
  description: { type: String, required: false },
});

const Collection = mongoose.model("Collection", CollectionSchema);
export default Collection;
