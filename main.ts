import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, setIcon } from 'obsidian';

// Remember to rename these classes and interfaces!

interface TranscribePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TranscribePluginSettings = {
	mySetting: 'default'
}

export default class TranscribePlugin extends Plugin {
	settings: TranscribePluginSettings;

	async onload() {
		await this.loadSettings();

		let isTranscribing: boolean = false;

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (_evt: MouseEvent) => {
		if (isTranscribing) {
				// Stop transcribing
				new Notice("Stopped transcribing.");
				isTranscribing = false;
				// Update icon and tooltip for start state
				setIcon(ribbonIconEl, 'mic-off');
				ribbonIconEl.setAttribute('aria-label', 'Start Listening');
			} else {
				// Start transcribing
				new Notice("Started transcribing.");
				isTranscribing = true;
				// Update icon and tooltip for stop state
				setIcon(ribbonIconEl, 'mic');
				ribbonIconEl.setAttribute('aria-label', 'Stop Listening');
			}
		});

		
		// Start transcribing command
		this.addCommand({
			id: 'start-transcribing-command',
			name: 'Start Transcribing',
			callback: () => {
				if (!isTranscribing) {
					// Start transcribing
					new Notice("Started transcribing.");
					isTranscribing = true;
					// Update icon and tooltip for stop state
					setIcon(ribbonIconEl, 'mic');
					ribbonIconEl.setAttribute('aria-label', 'Stop Listening');
				}
			}
		});

		// Stop transcribing command
		this.addCommand({
			id: 'stop-transcribing-command',
			name: 'Stop Transcribing',
			callback: () => {
				if (isTranscribing) {
					// Stop transcribing
					new Notice("Stopped transcribing.");
					isTranscribing = false;
					// Update icon and tooltip for start state
					setIcon(ribbonIconEl, 'mic-off');
					ribbonIconEl.setAttribute('aria-label', 'Start Listening');
				}
			}
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TranscribeModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class TranscribeSettingTab extends PluginSettingTab {
	plugin: TranscribePlugin;

	constructor(app: App, plugin: TranscribePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
