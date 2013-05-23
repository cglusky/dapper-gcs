/*
Waypoint state manager.
*/
var _ = require('underscore');

// Logging object (winston)
var log;

// Reference to the mavlink protocol object
var mavlink;

// Reference to the instantiated mavlink object, for access to target system/component.
var mavlinkParser;

// Index of the next expected waypoint to send to/receive from the UAV
var missionIndex = 0;

// This really needs to not be here.
var uavConnection;

// Handler when the ArduPilot requests individual waypoints: upon receiving a request,
// Send the next one.
function missionRequestHandler(missionItemRequest) {
	mavlinkParser.send(missionItems[missionIndex], uavConnection);
	log.info(util.inspect(missionItemRequest));
	log.info('Received mission item request, preparing to send mission item ['+missionIndex+']');
	missionIndex++;
}

function missionAckHandler(ack) {
	log.info('Received mission ack, mission items loaded onto payload.');
}


// Mapping from numbers (as those stored in waypoint files) to MAVLink commands.
var commandMap;

// Waypoints, an ordered array of waypoint MAVLink objects
var missionItems = [];

// Mission object constructor
MavMission = function(mavlinkProtocol, mavlinkProtocolInstance, uavConnectionObject, logger) {

	log = logger;
	mavlink = mavlinkProtocol;
	mavlinkParser = mavlinkProtocolInstance;
	uavConnection = uavConnectionObject;
}

// http://qgroundcontrol.org/mavlink/waypoint_protocol
MavMission.prototype.sendToPlatform = function() {

	// reset index of mission items to send to platform
	missionIndex = 0;

	// send mission_count
	var missionCount = new mavlink.messages.mission_count(mavlinkParser.srcSystem, mavlinkParser.srcComponent, missionItems.length);
	mavlinkParser.send(missionCount, uavConnection);

	// attach mission_request handler, let it cook
	mavlinkParser.on('MISSION_REQUEST', missionRequestHandler);
	mavlinkParser.on('MISSION_ACK', missionAckHandler);
};

// MissionItemMessage is a MAVLink MessageItem object
MavMission.prototype.addMissionItem = function(missionItemMessage) {
	missionItems.push(missionItemMessage);
};

MavMission.prototype.clearMissionItems = function(first_argument) {
	missionItems = [];
};

MavMission.prototype.loadMission = function() {
	loadMission(this);
};

// Stub for initial development/testing
loadMission = function(mission) {
	mission.clearMissionItems();

	_.each(missionItemsTesting, function(e, i, l) {
		// target_system, target_component, seq, frame, command, current, autocontinue, param1, param2, param3, param4, x, y, z
		mi = new mavlink.messages.mission_item(
			mavlinkParser.srcSystem,
			mavlinkParser.srcComponent,
			e[0],    // seq
			e[2],    // frame
			e[3],    // command
			e[1],    // current
			e[11],   // autocontinue
			e[4],  // param1,
			e[5],  // param2,
			e[6],  // param3
			e[7],  // param4
			e[8],  // x (latitude
			e[9],  // y (longitude
			e[10]  // z (altitude
		);
		mission.addMissionItem(mi)
	});

	mission.sendToPlatform();
};

// Shim for testing mission
var missionItemsTesting = [[0,1,3,0,0.000000,0.000000,0.000000,0.000000,-35.362881,149.165222,582.000000,1],
[1,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.362324,149.164291,120.000000,1],
[2,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.363670,149.164505,120.000000,1],
[3,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.362358,149.163651,120.000000,1],
[4,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.363777,149.163895,120.000000,1],
[5,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.362411,149.163071,120.000000,1],
[6,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.363865,149.163223,120.000000,1],
[7,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.362431,149.162384,120.000000,1],
[8,0,3,16,0.000000,0.000000,0.000000,0.000000,-35.363968,149.162567,120.000000,1],
[9,0,3,20,0.000000,0.000000,0.000000,0.000000,-35.363228,149.161896,30.000000,1]];


// Static placeholder for a mission to test

/*
# seq
# frame
# action
# current
# autocontinue
 # param1,
 # param2,
 # param3
 # param4
 # x, latitude
 # y, longitude
  # z
  */

module.exports = MavMission;