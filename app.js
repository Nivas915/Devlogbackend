const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
require('./Routes/reminderjob');
// Routes
const signupRoute = require('../Routes/Signup');
const loginRoute = require('../Routes/login');
const managerTeamRoute = require('../Routes/addteam');
const teamReqRoute = require('../Routes/teamreq'); 
const teamApprovalRoutes = require('../Routes/reqapproval');
const logsRouter = require('../Routes/log');
const notificationRoutes = require('../Routes/notification');

app.use('/api/notifications', notificationRoutes);
app.use('/api/reqappr', teamApprovalRoutes);
app.use('/api/manager/team', managerTeamRoute);
app.use('/api/developer/teamreq', teamReqRoute);
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/logs', logsRouter);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB connection failed:', err));

// Default route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
