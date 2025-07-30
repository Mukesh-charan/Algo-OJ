import { time } from 'console';
import mongoose from 'mongoose';
import { type } from 'os';
import { data } from 'react-router-dom';

const contestProblemsSchema = new mongoose.Schema({
  id: { type: String, required: true }
});

const contestUsersSchema = new mongoose.Schema({
  id:{ type:String },
  username: {type:String}
})


const ContestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: String,required: true },   // Change to Date type
  startTime: { type: String ,required: true },
  endDate: { type: String ,required: true },
  endTime: { type: String ,required: true },
  problems: [contestProblemsSchema],
  users: [contestUsersSchema],
  type:{ type: String},
});



const Contest = mongoose.model('Contest', ContestSchema);

export default Contest;