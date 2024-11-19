import { AxiosResponse } from "axios";
import { IRule } from "../models/IRule";
import $api from "../http";
import { IRuleSignal } from "../models/IRuleSignal";
import { ITrend } from "../models/ITrend";
import { ICombination } from "../models/ICombination";
import { ITradingPair } from "../models/ITradingPair";
import { IAdditionalOptions, ILevarage } from "../models/ILevarage";
import { IOption } from "../models/IOption";
import { DataInterace, IDate } from "../models/IDates";

export default class RuleService{
    static async getRules(): Promise<AxiosResponse<IRule[]>>{
        return $api.get<IRule[]>('/rules');
    }

    static async changeStatus(id: number): Promise<AxiosResponse>{
        return $api.put(`/rules/status/${id}`);
    }

    static async changeConnectionStatus(id: number): Promise<AxiosResponse>{
        return $api.put(`/rules/connection/${id}`);
    }

    static async getSignals(ruleName: string, timeframe: string): Promise<AxiosResponse<IRuleSignal[]>>{
        return $api.get<IRuleSignal[]>(`/rules/signals/${ruleName}/${timeframe}`);
    }

    static async getTrends(timeframe: string): Promise<AxiosResponse<ITrend[]>>{
        return $api.get<ITrend[]>(`/trends/${timeframe}`);
    }

    static async getSignalsForTrends(data: number[]): Promise<AxiosResponse<IRuleSignal[]>>{
        return $api.post<IRuleSignal[]>(`/trends/signals`, {ids: data});
    }

    static async getSignalsForTimframes(timeframe: string, pair: string): Promise<AxiosResponse<IRuleSignal[]>>{
        return $api.get<IRuleSignal[]>(`/timeframes/signals/${timeframe}/${pair}`);
    }

    static async getConnections(timeframe: string, type: string): Promise<AxiosResponse<ICombination[]>>{
        return $api.get<ICombination[]>(`/connections/${timeframe}/${type}`);
    }

    static async getTopConnections(istop: boolean, timeframe: number, pair: string, ): Promise<AxiosResponse<ICombination[]>>{
        return $api.get<ICombination[]>(`/connections/${istop}/${timeframe}/${pair}`);
    }

    static async getTradingPairs(): Promise<AxiosResponse<ITradingPair[]>>{
        return $api.get<ITradingPair[]>(`/tradingpairs/`);
    }

    static async getTopTradingPairs(): Promise<AxiosResponse<ITradingPair[]>>{
        return $api.get<ITradingPair[]>(`/tradingpairs/top/`);
    }

    static async getLevarages(): Promise<AxiosResponse<ILevarage[]>>{
        return $api.get<ILevarage[]>(`/settings/levarages/`);
    }

    static async getOptions(): Promise<AxiosResponse<IOption>>{
        return $api.get<IOption>(`/settings/options/`);
    }

    static async updateOption(key: string, secretKey: string, levarage: number): Promise<AxiosResponse<IOption>>{
        return $api.put<IOption>(`/settings/options/update/`, {key, secretKey, levarage});
    }

    static async getPairsForTrends(param: 'VN' | 'NN', timeframe: string): Promise<AxiosResponse<ITradingPair[]>>{
        return $api.get<ITradingPair[]>(`/tradingpairs/trends/${param}/${timeframe}`);
    }

    static async dumpsGetPreviousDates(): Promise<AxiosResponse<IDate[]>>{
        return $api.get<IDate[]>(`/dumps/dates`);
    }

    static async getFourHoursForDate(date: string): Promise<AxiosResponse<IDate[]>>{
        return $api.get<IDate[]>(`/dumps/dates/time/${date}`);
    }

    static async getDumpDataForDate(id: number): Promise<AxiosResponse<Record<string, Record<string, DataInterace>>[]>>{
        return $api.get<Record<string, Record<string, DataInterace>>[]>(`/dumps/dates/${id}`);
    }

    static async getDumpForHours(id: number): Promise<AxiosResponse<Record<string, Record<string, DataInterace>>[]>>{
        return $api.get<Record<string, Record<string, DataInterace>>[]>(`/dumps/time/${id}`);
    }

    static async getTopSignal(timeframe: number, pair: string): Promise<AxiosResponse<IRuleSignal[]>>{
        return $api.get<IRuleSignal[]>(`/dumps/topsignals/${timeframe}/${pair}`);
    }

    static async getAdditionalOptions(): Promise<AxiosResponse<IAdditionalOptions>>{
        return $api.get<IAdditionalOptions>(`/settins/options`);
    }

    static async saveAdditionalOptions(options: IAdditionalOptions): Promise<AxiosResponse<IAdditionalOptions>>{
        return $api.put<IAdditionalOptions>(`/settings/options`, options);
    }
}