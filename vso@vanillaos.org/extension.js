/*
 * License: GPLv3
 * Authors:
 *  Vanilla OS Contributors <https://github.com/vanilla-os/>
 * Copyright: 2023
 */

// following imports will be useful once we migrate the extension to GNOME 45
// import St from "gi://St";
// import GObject from "gi://GObject";
// import Gio from "gi://Gio";
// import GLib from "gi://GLib";

// import * as Main from "resource:///org/gnome/shell/ui/main.js";
// import * as ExtensionUtils from "resource:///org/gnome/shell/misc/util.js";
// import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
// import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

// import {
//   gettext as _,
//   ngettext as __,
// } from "resource:///org/gnome/shell/extensions/extension.js";

const GETTEXT_DOMAIN = "vso-update-check";

const { GObject, St, Gio, GLib, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

/* Defaults */
const FILE_CHECK_TIMEOUT = 60; // seconds
const ABROOT_STAGE_FILE = "/tmp/ABSystem.Upgrade.stage";
const ABROOT_USER_LOCK_FILE = "/tmp/ABSystem.Upgrade.user.lock";

const VSOUpdateCheckIndicator = GObject.registerClass(
  class VSOUpdateCheckIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("Vanilla OS On-going Update Check"));

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
      let file = Gio.File.new_for_path(ABROOT_USER_LOCK_FILE);
      file.replace_contents("", null, false, Gio.FileCreateFlags.NONE, null);

      this.destroy();

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
      let file = Gio.File.new_for_path(ABROOT_STAGE_FILE);

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

class VSOUpdateCheckExtension {
  constructor(uuid) {
    this._uuid = uuid;

    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
  }

  enable() {
    this._updateCheckIndicator = new VSOUpdateCheckIndicator();
    Main.panel.addToStatusArea(this._uuid, this._updateCheckIndicator);
  }

  disable() {
    this._updateCheckIndicator.destroy();
    this._updateCheckIndicator = null;
  }
}

function init(meta) {
  return new VSOUpdateCheckExtension(meta.uuid);
}
