import mongoose from "mongoose"

const SubmissionSchema = new mongoose.Schema ({
    problemId : {type:String, required : true},
    contestId : {type: String},
    points : {type: Number},
    status : {type: String, reqired : true},
    submissionTime : {type:Date, required : true},
    runTime:{type:String, required : true},
    userId : {type:String, required : true},
    userName: { type: String, required : true},
    problemName : {type : String, required : true},
    uuid : {type:String, required : true}
})

const Submission = mongoose.model('Submission',SubmissionSchema);

export default Submission;