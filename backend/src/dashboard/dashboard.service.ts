import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Incident, IncidentDocument } from '../incidents/schemas/incident.schema';
import { IncidentStatus } from '../incidents/incident-status.enum';
import { IncidentSeverity } from '../incidents/incident-severity.enum';

@Injectable()
export class DashboardService {
    constructor(@InjectModel(Incident.name) private readonly incidentModel: Model<IncidentDocument>) {}

    async getStats() {
        const [result] = await this.incidentModel.aggregate([
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: null,
                                open: {
                                    $sum: {
                                        $cond: [{$eq: ['$status', IncidentStatus.Open]}, 1, 0]
                                    }
                                },

                                closed: {
                                    $sum: {
                                        $cond: [{$eq: ['$status', IncidentStatus.Closed]}, 1, 0]
                                    }
                                },

                                critical: {
                                    $sum: {
                                        $cond: [{$eq: ['$severity', IncidentSeverity.Critical]}, 1, 0]
                                    }
                                }
                            }
                        }
                    ],


                    bySeverity: [
                        {
                            $group: {
                                _id:'$severity',
                                count: { $sum: 1}
                            }
                        },

                        {
                            $project: {
                                _id:0,
                                severity: '$_id',
                                count: 1
                            }
                        },

                        {
                            $sort: {severity: 1}
                        }
                    ],

                    byStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1}
                            }
                        },

                        {
                            $project: {
                                _id: 0,
                                status: '$_id',
                                count: 1
                            }
                        },

                        {
                            $sort: {status: 1}
                        }
                    ],

                    monthlyTrend: [
                        {
                            $group: {
                                _id:{
                                    $dateToString: {
                                        format: '%Y-%m',
                                        date: '$createdAt'
                                    }
                                },
                                count: {$sum: 1}
                            }
                        },

                        {
                            $project: {
                                _id: 0,
                                month: '$_id',
                                count: 1
                            }
                        },

                        {$sort: {month: 1}}
                    ],

                    avgResolution: [
                        {
                            $match: {
                                resolvedAt: {$exists: true}
                            }
                        },

                        {
                            $project: {
                                resolutionHours: {
                                    $divide: [
                                        { $subtract: ['$resolvedAt', '$createdAt']},
                                        1000 * 60 * 60
                                    ]
                                }
                            }
                        },

                        {
                            $group: {
                                _id:null,
                                avgResolutionHours: { $avg: '$resolutionHours'}
                            }
                        }
                    ]



                }
            } 
        ])

        return {
            totals: {
                open: result.totals[0]?.open ?? 0,
                closed: result.totals[0]?.closed ?? 0,
                critical: result.totals[0]?.critical ?? 0,
                avgResolutionHours: result.avgResolution[0]?.avgResolutionHours ?? 0
            },
            bySeverity: result.bySeverity,
            byStatus: result.byStatus,
            monthlyTrend: result.monthlyTrend
        }
    }

}
