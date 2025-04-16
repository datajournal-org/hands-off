export interface Calendar {
	data: Data
}

export interface Data {
	searchEvents: SearchEvents
}

export interface SearchEvents {
	__typename: string
	elements: Element[]
	total: number
}

export interface Element {
	__typename: string
	attributedTo?: AttributedTo
	beginsOn: string
	endsOn: string
	id: string
	options: Options
	organizerActor?: OrganizerActor
	physicalAddress?: PhysicalAddress
	picture?: Picture
	status: string
	tags: Tag[]
	title: string
	uuid: string
}

export interface AttributedTo {
	__typename: string
	avatar?: Avatar
	domain: unknown
	id: string
	name: string
	preferredUsername: string
	summary?: string
	type: string
	url: string
}

export interface Avatar {
	__typename: string
	id: string
	url: string
}

export interface Options {
	__typename: string
	anonymousParticipation: boolean
	attendees: unknown[]
	commentModeration: string
	hideNumberOfParticipants: boolean
	hideOrganizerWhenGroupEvent: boolean
	isOnline: boolean
	maximumAttendeeCapacity: number
	offers: unknown[]
	participationConditions: unknown
	program: unknown
	remainingAttendeeCapacity: number
	showEndTime: boolean
	showParticipationPrice: boolean
	showRemainingAttendeeCapacity: boolean
	showStartTime: boolean
	timezone?: string
}

export interface OrganizerActor {
	__typename: string
	avatar?: Avatar2
	domain: unknown
	id: string
	name?: string
	preferredUsername: string
	summary?: string
	type: string
	url: string
}

export interface Avatar2 {
	__typename: string
	id: string
	url: string
}

export interface PhysicalAddress {
	__typename: string
	country?: string
	description: string
	geom?: string
	id: string
	locality?: string
	originId?: string
	pictureInfo: unknown
	postalCode?: string
	region?: string
	street?: string
	timezone?: string
	type?: string
	url: string
}

export interface Picture {
	__typename: string
	id: string
	url: string
}

export interface Tag {
	__typename: string
	id: string
	slug: string
	title: string
}
