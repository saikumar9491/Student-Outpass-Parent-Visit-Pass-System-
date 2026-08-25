const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student roll number/ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year of study is required'],
      trim: true,
    },
    hostel: {
      type: String,
      required: [true, 'Hostel block is required'],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    parentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    collegeData: {
      attendance: {
        type: String,
        default: '87.5%',
      },
      timetable: [
        {
          day: String,
          subjects: [String],
        },
      ],
      examResults: [
        {
          examName: String,
          marks: String,
          grade: String,
        },
      ],
      notices: [
        {
          title: String,
          content: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.pre('save', function (next) {
  if (!this.collegeData || !this.collegeData.timetable || this.collegeData.timetable.length === 0) {
    this.collegeData = {
      attendance: '87.5%',
      timetable: [
        { day: 'Monday', subjects: ['CS-301 Data Structures (09:00 AM)', 'CS-302 Discrete Math (11:00 AM)', 'CS-303 Algorithms Design (02:00 PM)'] },
        { day: 'Tuesday', subjects: ['CS-304 Database Systems (10:00 AM)', 'CS-305 Compiler Design (01:00 PM)'] },
        { day: 'Wednesday', subjects: ['CS-301 Data Structures (09:00 AM)', 'CS-303 Algorithms Design (02:00 PM)'] },
        { day: 'Thursday', subjects: ['CS-304 Database Systems (10:00 AM)', 'CS-306 Software Engineering (03:00 PM)'] },
        { day: 'Friday', subjects: ['CS-302 Discrete Math (11:00 AM)', 'CS-305 Compiler Design (01:00 PM)', 'CS-307 Lab Practicum (02:00 PM)'] }
      ],
      examResults: [
        { examName: 'First Midterm Examination', marks: '88/100', grade: 'A' },
        { examName: 'Second Midterm Examination', marks: '92/100', grade: 'O' },
        { examName: 'Lab Internal Assessment', marks: '45/50', grade: 'A+' }
      ],
      notices: [
        { title: 'Hostel Maintenance Shutdown', content: 'Power grid maintenance on Saturday from 10:00 AM to 02:00 PM.', date: new Date() },
        { title: 'Mid-Semester Exam Schedule', content: 'Theory paper schedule is published. Please review on student board.', date: new Date(Date.now() - 86400000) }
      ]
    };
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
