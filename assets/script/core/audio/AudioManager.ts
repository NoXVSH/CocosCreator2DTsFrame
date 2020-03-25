import LoaderManager from "../loader/LoaderManager";
import MyGlobal from "../../config/MyGlobal";


export enum AUDIO_TYPE{
    SOUND_MUSIC = 1,
    SOUND_EFFECT = 2,
}

export interface AudioPlayData {
    type : AUDIO_TYPE,
    url : string,
    loop : boolean,
    volume : number,
}

export default class AudioManager {
    private static _instance : AudioManager;

    static get Instance() : AudioManager {
        if(this._instance == null) {
            this._instance = new AudioManager();
        }

        return this._instance;
    }

    private _effectMap: {[key : number] : {url : string, id : number | boolean}} = {}; //音效映射， key对应的数值，true表示正在启动中，否则对应audioId
    private _effKeyTick: number = 0;  //递增key
    private _musicLoadUrl : string = null;
    private _musicSwitch : boolean = false;
    private _effectSwitch : boolean = false;
    private _musicData : AudioPlayData = null;
    private _musicUrl : string = null;

    public loadAudio(url : string, type : AUDIO_TYPE, callback : Function) : void {
        url = "mp3/" + url;
        
        let errorback = () => {
            LoaderManager.Instance.unload(url);
        }
        LoaderManager.Instance.load(url, cc.AudioClip, callback, errorback);

        if (type == AUDIO_TYPE.SOUND_MUSIC) {
            this._musicLoadUrl = url;
        } 
    }

    public clear() : void {
        for (const key in this._effectMap) {
            const data = this._effectMap[key];
            if (data.id !== true) {  // 1 == true 成立  2 == true不成立
                const state = cc.audioEngine.getState(data.id as number);
                // log(state);
                if (state != cc.audioEngine.AudioState.PLAYING) {
                    LoaderManager.Instance.unload(data.url);
                    delete this._effectMap[key];
                }
            }
        }
    }

    public play(data : AudioPlayData) : number | null {
        this._musicSwitch = true;
        this._effectSwitch = MyGlobal.Instance.getHaveSound();

        if (data.type == AUDIO_TYPE.SOUND_MUSIC) {
            this._musicData = null;

            if (this._musicSwitch) {
                if (data.url == this._musicUrl) {
                    return;
                }

                this._musicUrl = data.url;
                this.loadAudio(data.url, data.type, function (clip) {
                    cc.audioEngine.playMusic(
                        clip,
                        data.loop
                    );
                }.bind(this));
            } else {
                this._musicData = data;
            }
        } else if (data.type == AUDIO_TYPE.SOUND_EFFECT) {
            if (this._effectSwitch) {
                let key = this._effKeyTick++;
                this._effectMap[key] = { url: "mp3/" + data.url, id: true };

                this.loadAudio(data.url, data.type, function (clip) {
                    if (!this._effectSwitch) return;
                    if (!this._effectMap[key]) return; //已经在外部停掉了
                    this._effectMap[key].id = cc.audioEngine.playEffect(clip, data.loop);
                }.bind(this));

                return key;
            }
        }
        return null;
    }

    public playAudioEffect(name) : number | null {
        let data : AudioPlayData = {} as AudioPlayData;

        data.type = AUDIO_TYPE.SOUND_EFFECT;
        data.url = name;
        data.loop = false;
        data.volume = 0.5;

        return this.play(data);
    }

    
    //停止背景音乐
    public stopAudioMusic() : void {
        if (this._musicLoadUrl != null) {
            cc.audioEngine.stopMusic();
            // LoaderManager.Instance.unload(this._musicLoadUrl); 不用卸载
            this._musicLoadUrl = null;
            this._musicUrl = null;
        }
    }

    //停止指定的音效
    public stopAudioEffect(key : number) : void {
        let effectData = this._effectMap[key];
        if (!effectData) return;
        //如果已经播放，则先停掉播放中的音效
        if (effectData.id != true) cc.audioEngine.stopEffect(effectData.id as number);
        delete this._effectMap[key];
    }

    public setMusicSwitch(value : boolean) : void {
        this._musicSwitch = value;
        if (this._musicSwitch) {
            if (this._musicData) {
                this.play(this._musicData);
            } else {
                cc.audioEngine.resumeMusic();
            }
        } else {
            cc.audioEngine.pauseMusic();
        }
    }

    public setEffectSwitch(value) : void {
        this._effectSwitch = value;
    }

    public getEffectSwitch() : boolean {
        return this._effectSwitch;
    }

}


window.regVar("AudioManager", AudioManager); //注入全局 方便调试而已







