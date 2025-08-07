#!/usr/bin/env bash

# Copyright (c) 2021-2025 community-scripts ORG 
# Author: thomashondema
# License: MIT | https://github.com/community-scripts/ProxmoxVE/raw/main/LICENSE

source /dev/stdin <<< "$FUNCTIONS_FILE_PATH"
color
verb_ip6
catch_errors
setting_up_container
network_check
update_os

msg_info "Installing Dependencies"

cat <<EOF > /etc/apt/sources.list
deb https://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian bookworm main contrib non-free non-free-firmware

deb https://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb-src https://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware

deb https://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
EOF

echo "Package: fake-package
Pin: release n=bookworm-updates, c=contrib
Pin-Priority: 1" > /etc/apt/preferences.d/fake-contrib

apt update && apt upgrade -y

msg_info "Installing Automatic Ripping Machine"
msg_info "Warnings about missing contrib repositories can be safely ignored"

bash -c "$(curl -fsSL https://raw.githubusercontent.com/automatic-ripping-machine/automatic-ripping-machine/main/scripts/installers/DebianInstaller.sh)"

msg_ok "Installed Automatic Ripping Machine"

msg_info "Creating Service"

motd_ssh
customize

msg_info "Cleaning up"
$STD apt-get -y autoremove
$STD apt-get -y autoclean
#rm -rf "/opt/v${RELEASE}.tar.gz"
msg_ok "Cleaned"
