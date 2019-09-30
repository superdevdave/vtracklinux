#!/bin/bash

#copy files and folders to applications folder

sudo mkdir -p /etc/VTrack
sudo cp -f vtrack-linux /etc/VTrack
sudo cp -f vtrack.config /etc/VTrack
sudo cp -f run.sh /etc/VTrack


#chmod the files and folders to read write execute

sudo chmod 777 /etc/VTrack
sudo chmod +x /etc/VTrack/vtrack-linux
sudo chmod +x /etc/VTrack/run.sh
sudo chmod 777 /etc/VTrack/vtrack.config




#add the executable to SystemD
sudo cp -f vtrack.service /etc/systemd/system
systemctl enable vtrack.service

