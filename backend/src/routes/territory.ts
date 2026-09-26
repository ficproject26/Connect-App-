import { Router, Request, Response } from 'express';
import { db } from '../db';
import { ObjectId } from 'mongodb';

const router = Router();

// Helper to convert hex string to ObjectId safely
const toObjectId = (val: any) => {
  if (val instanceof ObjectId) return val;
  if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
    try { return new ObjectId(val); } catch (e) { return null; }
  }
  return null;
};

// 1. GET /api/territory/states
router.get('/states', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const states = await mongoDb.collection('states').find({ status: 'Active' }).sort({ name: 1 }).toArray();
    res.json({ success: true, states, data: states });
  } catch (err: any) {
    console.error('Territory get states error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve states' });
  }
});

// 2. GET /api/territory/districts
router.get('/districts', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const { stateId, state } = req.query as { stateId?: string; state?: string };
    const query: any = { status: 'Active' };

    let resolvedStateId: any = stateId;
    if (!resolvedStateId && state) {
      const stateDoc = await mongoDb.collection('states').findOne({
        name: new RegExp('^' + state.trim() + '$', 'i'),
        status: 'Active'
      });
      if (stateDoc) resolvedStateId = stateDoc._id;
    }

    if (resolvedStateId) {
      const objId = toObjectId(resolvedStateId);
      const orList: any[] = [{ stateId: resolvedStateId.toString() }];
      if (objId) orList.push({ stateId: objId });
      query.$or = orList;
    }

    const districts = await mongoDb.collection('districts').find(query).sort({ name: 1 }).toArray();
    res.json({ success: true, districts, data: districts });
  } catch (err: any) {
    console.error('Territory get districts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve districts' });
  }
});

// 3. GET /api/territory/divisions
router.get('/divisions', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const { districtId, district, stateId } = req.query as { districtId?: string; district?: string; stateId?: string };
    const query: any = { status: 'Active' };

    let resolvedDistrictId: any = districtId;
    if (!resolvedDistrictId && district) {
      const distDoc = await mongoDb.collection('districts').findOne({
        name: new RegExp('^' + district.trim() + '$', 'i'),
        status: 'Active'
      });
      if (distDoc) resolvedDistrictId = distDoc._id;
    }

    if (resolvedDistrictId) {
      const objId = toObjectId(resolvedDistrictId);
      const orList: any[] = [{ districtId: resolvedDistrictId.toString() }];
      if (objId) orList.push({ districtId: objId });
      query.$or = orList;
    } else if (stateId) {
      const objId = toObjectId(stateId);
      const orList: any[] = [{ stateId: stateId.toString() }];
      if (objId) orList.push({ stateId: objId });
      query.$or = orList;
    }

    const divisions = await mongoDb.collection('divisions').find(query).sort({ name: 1 }).toArray();
    res.json({ success: true, divisions, data: divisions });
  } catch (err: any) {
    console.error('Territory get divisions error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve divisions' });
  }
});

// 4. GET /api/territory/pincodes
router.get('/pincodes', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const { divisionId, division, districtId, district, stateId } = req.query as any;
    const query: any = { status: 'Active' };

    let resolvedDivId: any = divisionId;
    if (!resolvedDivId && division) {
      const divDoc = await mongoDb.collection('divisions').findOne({
        name: new RegExp('^' + division.trim() + '$', 'i'),
        status: 'Active'
      });
      if (divDoc) resolvedDivId = divDoc._id;
    }

    if (resolvedDivId) {
      const objId = toObjectId(resolvedDivId);
      const orList: any[] = [{ divisionId: resolvedDivId.toString() }];
      if (objId) orList.push({ divisionId: objId });
      query.$or = orList;
    } else if (districtId) {
      const objId = toObjectId(districtId);
      const orList: any[] = [{ districtId: districtId.toString() }];
      if (objId) orList.push({ districtId: objId });
      query.$or = orList;
    } else if (district) {
      query.district = new RegExp('^' + district.trim() + '$', 'i');
    }

    const pincodes = await mongoDb.collection('pincodes').find(query).sort({ code: 1 }).toArray();
    res.json({ success: true, pincodes, data: pincodes });
  } catch (err: any) {
    console.error('Territory get pincodes error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve pincodes' });
  }
});

// 5. GET /api/territory/lookup/:code
router.get('/lookup/:code', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const code = req.params.code.trim();
    const pin = await mongoDb.collection('pincodes').findOne({ code, status: 'Active' });
    if (!pin) {
      return res.status(404).json({ success: false, message: `Pincode '${code}' is not active or registered in Admin Territory Management.` });
    }

    const [div, dist, st] = await Promise.all([
      pin.divisionId ? mongoDb.collection('divisions').findOne({ _id: pin.divisionId }) : (pin.division ? mongoDb.collection('divisions').findOne({ name: pin.division }) : null),
      pin.districtId ? mongoDb.collection('districts').findOne({ _id: pin.districtId }) : (pin.district ? mongoDb.collection('districts').findOne({ name: pin.district }) : null),
      pin.stateId ? mongoDb.collection('states').findOne({ _id: pin.stateId }) : (pin.state ? mongoDb.collection('states').findOne({ name: pin.state }) : null)
    ]);

    res.json({
      success: true,
      data: {
        pincode: pin.code,
        name: pin.name,
        area: pin.area || pin.name,
        division: div ? div.name : pin.division,
        district: dist ? dist.name : pin.district,
        state: st ? st.name : pin.state,
        divisionId: div?._id || pin.divisionId,
        districtId: dist?._id || pin.districtId,
        stateId: st?._id || pin.stateId,
        status: pin.status
      }
    });
  } catch (err: any) {
    console.error('Territory lookup error:', err);
    res.status(500).json({ success: false, message: 'Failed to lookup pincode' });
  }
});

// 6. GET /api/territory/hierarchy
router.get('/hierarchy', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const [states, districts, divisions, pincodes] = await Promise.all([
      mongoDb.collection('states').find({ status: 'Active' }).sort({ name: 1 }).toArray(),
      mongoDb.collection('districts').find({ status: 'Active' }).sort({ name: 1 }).toArray(),
      mongoDb.collection('divisions').find({ status: 'Active' }).sort({ name: 1 }).toArray(),
      mongoDb.collection('pincodes').find({ status: 'Active' }).sort({ code: 1 }).toArray()
    ]);

    const stateMap: Record<string, any> = {};
    states.forEach((s: any) => {
      const sId = s._id.toString();
      stateMap[sId] = {
        ...s,
        districts: []
      };
    });

    const distMap: Record<string, any> = {};
    districts.forEach((d: any) => {
      const dId = d._id.toString();
      const sId = d.stateId ? d.stateId.toString() : '';
      const distNode = {
        ...d,
        divisions: []
      };
      distMap[dId] = distNode;
      if (sId && stateMap[sId]) {
        stateMap[sId].districts.push(distNode);
      }
    });

    const divMap: Record<string, any> = {};
    divisions.forEach((v: any) => {
      const vId = v._id.toString();
      const dId = v.districtId ? v.districtId.toString() : '';
      const divNode = {
        ...v,
        pincodes: []
      };
      divMap[vId] = divNode;
      if (dId && distMap[dId]) {
        distMap[dId].divisions.push(divNode);
      }
    });

    pincodes.forEach((p: any) => {
      const vId = p.divisionId ? p.divisionId.toString() : '';
      if (vId && divMap[vId]) {
        divMap[vId].pincodes.push(p);
      }
    });

    const hierarchyList = Object.values(stateMap);
    res.json({
      success: true,
      hierarchy: hierarchyList,
      states: hierarchyList,
      totalStates: states.length,
      totalDistricts: districts.length,
      totalDivisions: divisions.length,
      totalPincodes: pincodes.length
    });
  } catch (err: any) {
    console.error('Territory get hierarchy error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve territory hierarchy' });
  }
});

// 7. POST /api/territory/validate
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const mongoDb = db.getDb();
    if (!mongoDb) return res.status(503).json({ success: false, message: 'Database connecting' });

    const { state, district, division, pincode } = req.body;

    let stateDoc: any = null;
    let distDoc: any = null;
    let divDoc: any = null;
    let pinDoc: any = null;

    if (state) {
      const objId = toObjectId(state);
      const orClauses: any[] = [{ name: new RegExp('^' + String(state).trim() + '$', 'i') }];
      if (objId) orClauses.push({ _id: objId });

      stateDoc = await mongoDb.collection('states').findOne({
        $or: orClauses,
        status: 'Active'
      });
      if (!stateDoc) {
        return res.status(400).json({ success: false, message: `State '${state}' does not exist or is not active.` });
      }
    }

    if (district) {
      const sId = stateDoc ? stateDoc._id : null;
      const objId = toObjectId(district);
      const orClauses: any[] = [{ name: new RegExp('^' + String(district).trim() + '$', 'i') }];
      if (objId) orClauses.push({ _id: objId });

      const q: any = {
        $or: orClauses,
        status: 'Active'
      };
      if (sId) {
        q.stateId = { $in: [sId, sId.toString()] };
      }
      distDoc = await mongoDb.collection('districts').findOne(q);
      if (!distDoc) {
        return res.status(400).json({ success: false, message: `District '${district}' does not belong to selected State or is not active.` });
      }
    }

    if (division) {
      const dId = distDoc ? distDoc._id : null;
      const objId = toObjectId(division);
      const orClauses: any[] = [{ name: new RegExp('^' + String(division).trim() + '$', 'i') }];
      if (objId) orClauses.push({ _id: objId });

      const q: any = {
        $or: orClauses,
        status: 'Active'
      };
      if (dId) {
        q.districtId = { $in: [dId, dId.toString()] };
      }
      divDoc = await mongoDb.collection('divisions').findOne(q);
      if (!divDoc) {
        return res.status(400).json({ success: false, message: `Division '${division}' does not belong to selected District or is not active.` });
      }
    }

    if (pincode) {
      const vId = divDoc ? divDoc._id : null;
      const q: any = {
        code: String(pincode).trim(),
        status: 'Active'
      };
      if (vId) {
        q.divisionId = { $in: [vId, vId.toString()] };
      }
      pinDoc = await mongoDb.collection('pincodes').findOne(q);
      if (!pinDoc) {
        return res.status(400).json({ success: false, message: `PIN Code '${pincode}' does not belong to selected Division or is not active.` });
      }
    }

    res.json({
      success: true,
      valid: true,
      state: stateDoc?.name,
      district: distDoc?.name,
      division: divDoc?.name,
      pincode: pinDoc?.code
    });
  } catch (err: any) {
    console.error('Territory validate error:', err);
    res.status(500).json({ success: false, message: 'Validation failed' });
  }
});

export default router;
