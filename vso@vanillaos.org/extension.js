/*
 * License: GPLv3
 * Authors:
 *  Vanilla OS Contributors <https://github.com/vanilla-os/>
 * Copyright: 2023
 */

import St from "gi://St";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";

const GETTEXT_DOMAIN = "vso-update-check";

/* Defaults */
const FILE_CHECK_TIMEOUT = 60; // seconds
const OPERATION_LOCK_FILE = "/run/abroot/operation.lock";
const FINALIZING_FILE = "/run/abroot/finalizing"
const FINISHED_OPERATION_FILE = "/run/abroot/finished"

const VSOUpdateIndicator = GObject.registerClass(
  {
    GTypeName: "VSOUpdateIndicator",
  },
  class VSOUpdateIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("Vanilla OS On-going Update Check"));

      this.stopChecking = false;

      this.add_child(
        new St.Icon({
          icon_name: "folder-download-symbolic",
          style_class: "system-status-icon",
        })
      );

      let msgUpdateItem = new PopupMenu.PopupMenuItem(
        _("A system update is being applied in the background")
      );
      msgUpdateItem.setSensitive(false);
      this.menu.addMenuItem(msgUpdateItem);

      let stopUpdateItem = new PopupMenu.PopupMenuItem(
        _("Stop on-going update")
      );
      stopUpdateItem.connect("activate", this._stopOnGoingUpdate.bind(this));
      this.menu.addMenuItem(stopUpdateItem);

      // Start checking for the stage file
      this._checkUpdateFile();
    }

    /**
     * Stop the update and send the request.
     */
    _stopOnGoingUpdate() {
      GLib.spawn_command_line_async('pkexec abroot upgrade --cancel');

      Main.notify(
        _("Stop Update Request Sent"),
        _("The system will attempt to halt the update process if possible.")
      );
    }

    /**
     * Checks for the existence of the stage file and shows/hides the
     * indicator accordingly and schedules the next check.
     */
    _checkUpdateFile() {
      if (this.stopChecking)
          return;

      let file = Gio.File.new_for_path(OPERATION_LOCK_FILE);

      if (file.query_exists(null)) {
        this.show();
      } else {
        this.hide();
      }

      GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        FILE_CHECK_TIMEOUT,
        this._checkUpdateFile.bind(this)
      );
    }
  }
);

export default class VSOUpdateCheckExtension extends Extension {
  constructor(metadata) {
    super(metadata);
  }

  enable() {
    this._updateCheckIndicator = new VSOUpdateIndicator();
    Main.panel.addToStatusArea(this.uuid, this._updateCheckIndicator);
  }

  disable() {
    this._updateCheckIndicator.stopChecking = true;
    this._updateCheckIndicator.destroy();
    this._updateCheckIndicator = null;
  }
}
