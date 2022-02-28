const GLib = imports.gi.GLib;

const GnomeSession = imports.misc.gnomeSession;
const MessageTray = imports.ui.messageTray;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;

class Extension {
    _executeCommand(command) {
        let [, stdout] = GLib.spawn_command_line_sync(command);
        return stdout.toString();
    }

    _restartPopup() {
        let source = new MessageTray.Source("supergfx-gse", "system-log-out-symbolic");
        Main.messageTray.add(source);
        let notification = new MessageTray.Notification(source, "GPU Mode changed", "You need to log out to apply changes");
        notification.setTransient(true);
        notification.setUrgency(3);
        notification.setResident(true);
        notification.addAction("Log Out", () => {
            var sessionManager = new GnomeSession.SessionManager();
            sessionManager.LogoutRemote(0);
        });
        source.showNotification(notification);
    }

    constructor() {

    }

    enable() {
        this.currentMode = this._executeCommand("supergfxctl -g");

        this.popupMenuButtonIntegrated = new PopupMenu.PopupImageMenuItem("Integrated GPU", this.currentMode == "integrated\n" ? "radio-checked-symbolic" : "radio-symbolic");
        this.popupMenuButtonIntegrated.connect("activate", () => {
           this._executeCommand("supergfxctl -m integrated");
           this._restartPopup();
        });

        this.popupMenuButtonHybrid = new PopupMenu.PopupImageMenuItem("Hybrid GPU", this.currentMode == "hybrid\n" ? "radio-checked-symbolic" : "radio-symbolic");
        this.popupMenuButtonHybrid.connect("activate", () => {
            this._executeCommand("supergfxctl -m hybrid");
            this._restartPopup();
        });

        this.popupMenuButtonDedicated = new PopupMenu.PopupImageMenuItem("Dedicated GPU", this.currentMode == "dedicated\n" ? "radio-checked-symbolic" : "radio-symbolic");
        this.popupMenuButtonDedicated.connect("activate", () => {
            this._executeCommand("supergfxctl -m dedicated");
            this._restartPopup();
        });

        this.popupMenuItemSeparator = new PopupMenu.PopupSeparatorMenuItem();

        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.popupMenuButtonIntegrated, 11);
        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.popupMenuButtonHybrid, 12);
        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.popupMenuButtonDedicated, 13);
        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.popupMenuItemSeparator, 14);
    }

    disable() {
        this.popupMenuButtonIntegrated.destroy();
        this.popupMenuButtonHybrid.destroy();
        this.popupMenuButtonDedicated.destroy();

        this.popupMenuItemSeparator.destroy();
    }
}

function init() {
    return new Extension();
}

/**
 * https://gjs-docs.gnome.org/st10~1.0_api/
 * https://github.com/GNOME/gnome-shell/blob/main/js/ui/panel.js
 * 
 * https://github.com/GNOME/gnome-shell/blob/main/js/ui/panelMenu.js
 * https://github.com/GNOME/gnome-shell/blob/main/js/ui/popupMenu.js
 */