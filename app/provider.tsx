"use client"

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import React from 'react'

import { ReactNode } from 'react';

const Provider = ({ children }: { children: ReactNode }) => {

    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    return (
        <div>
            <ConvexProvider client={convex}>{children}</ConvexProvider>
        </div>
    )
}

export default Provider