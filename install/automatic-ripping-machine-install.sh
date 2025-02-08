#!/usr/bin/env bash

# License: MIT
# https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE

source /dev/stdin <<< "$FUNCTIONS_FILE_PATH"
color
verb_ip6
catch_errors
setting_up_container
network_check
update_os

msg_info "Installing Dependencies"
$STD apt-get install -y curl
$STD apt-get install -y sudo
$STD apt-get install -y mc
$STD apt-get install -y git
$STD apt-get install -y python3-pip
$STD apt-get install -y python3-venv
$STD apt-get install -y ffmpeg
$STD apt-get install -y libdvdcss2
$STD apt-get install -y handbrake-cli
$STD apt-get install -y makemkv-bin
$STD apt-get install -y libavcodec-extra
$STD apt-get install -y abcde
$STD apt-get install -y flac
$STD apt-get install -y imagemagick
$STD apt-get install -y udev
msg_ok "Installed Dependencies"

msg_info "Installing Automatic Ripping Machine"
RELEASE=$(curl -s https://api.github.com/repos/automatic-ripping-machine/automatic-ripping-machine/releases/latest | grep "tag_name" | awk '{print substr($2, 2, length($2)-3) }')
cd /opt
wget -q "https://github.com/automatic-ripping-machine/automatic-ripping-machine/archive/refs/tags/v${RELEASE}.tar.gz"
tar xzf "v${RELEASE}.tar.gz"
mv "automatic-ripping-machine-${RELEASE}" arm
cd arm
python3 -m venv venv
source venv/bin/activate
$STD pip install -r requirements.txt
mkdir -p /opt/arm/config
cp /opt/arm/setup/arm.yaml.sample /opt/arm/config/arm.yaml
echo "${RELEASE}" >/opt/${APPLICATION}_version.txt
msg_ok "Installed Automatic Ripping Machine"

msg_info "Creating Service"
cat <<EOF >/etc/systemd/system/arm.service
[Unit]
Description=Automatic Ripping Machine
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/arm
Environment=PYTHONPATH=/opt/arm
ExecStart=/opt/arm/venv/bin/python /opt/arm/arm/ripper/main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

cat <<EOF >/etc/systemd/system/armui.service
[Unit]
Description=Automatic Ripping Machine Web UI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/arm
Environment=PYTHONPATH=/opt/arm
ExecStart=/opt/arm/venv/bin/python /opt/arm/arm/ui/app.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable -q --now arm.service
systemctl enable -q --now armui.service
msg_ok "Created Services"

motd_ssh
customize

msg_info "Cleaning up"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
rm -rf "/opt/v${RELEASE}.tar.gz"
msg_ok "Cleaned"
