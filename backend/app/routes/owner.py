from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.userdetail import User, Property, PropertyTenant
from app.dependencies.auth import get_current_user
from app.schemas.users import TenantListView, TenantView
from app.schemas.properties import PropertyView, AddProperty, UpdateProperty, PropertyListView, UnassignedPropertyList, UnassignedTenantList, UnassignedTenantBasic
from app.schemas.tenantproperty import TenantPropertyView, AssignProperty, EditTenantProperty, TenantPropertySummary, TenantWithProperties, TenantWithPropertiesList
from app.database.postgresql import get_db

router = APIRouter(prefix="/owner",tags=["owner"],dependencies=[Depends(get_current_user)])

# User function
@router.get("/{owner_id}/tenants", response_model=TenantListView)
def get_tenants(owner_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Only admin or the owner themselves can access
    if current_user["role"] != "admin" and current_user["user_id"] != owner_id:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    tenants = db.query(User).filter(User.owner_id == owner_id, User.role == "tenant").all()

    return {
        "owner_name": owner.name,
        "total_tenants": len(tenants),
        "tenants": tenants
    }

@router.delete("/{owner_id}/tenants/{tenant_id}",response_model=TenantView)
def delete_tenant(owner_id: int, tenant_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    if not (current_user["role"] == "admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied")
     
    tenant = db.query(User).filter(User.id == tenant_id, User.owner_id == owner_id, User.role == "tenant").first()
    
    if not tenant:
        raise HTTPException(status_code=400, detail="Check if the tenant id is valid")
    tenant_value = TenantView(id=tenant_id, owner_id=owner_id,name=tenant.name,email=tenant.email,role=tenant.role)
    db.delete(tenant)
    db.commit()
    
    return tenant_value


# Property function 

@router.get("/{owner_id}/property",response_model=PropertyListView)
def get_property(owner_id: int, db: Session=Depends(get_db),current_user = Depends(get_current_user)):
    
    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Invalid owner id")
    
    tenant=db.query(User).filter(User.id == current_user["user_id"], User.role == "tenant").first() 
    if not (current_user["role"] == "admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id) or (tenant is not None and tenant.owner_id == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied") 
    
    
    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    properties = db.query(Property).filter(Property.owner_id==owner_id).all()

    return {"owner_name": owner.name, "property_count": len(properties), "property": properties }

@router.delete("/{owner_id}/property/{property_id}",response_model=PropertyView)
def delete_property(owner_id: int, property_id: int, db: Session=Depends(get_db),current_user = Depends(get_current_user)):
    if not (current_user["role"] == "admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied") 
    
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id==owner_id).first()
    if not prop: 
        raise HTTPException(status_code=400, detail="Check if the property id is valid")
    prop_data = PropertyView(id=prop.id, owner_id=prop.owner_id, name=prop.name, address=prop.address, price=prop.price)
    db.delete(prop)
    db.commit()
    
    return prop_data


@router.post("/{owner_id}/property",response_model=PropertyView)
def add_property(owner_id: int,payload: AddProperty, db: Session=Depends(get_db),current_user = Depends(get_current_user)):
    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    if not owner: 
        raise HTTPException(status_code=404, detail="Invalid owner id") 
    if not (current_user["role"] == "admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied") 
    
    prop = Property(owner_id=owner_id, name=payload.name, address=payload.address, price=payload.price)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.put("/{owner_id}/property/{property_id}",response_model=PropertyView)
def edit_property(owner_id: int, property_id: int,payload: UpdateProperty, db: Session=Depends(get_db),current_user = Depends(get_current_user)):
    
    if not (current_user["role"] == "admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied") 
    
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop: 
        raise HTTPException(status_code=404, detail="Property not found")
    if prop.owner_id != owner_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if payload.name is not None:
        prop.name = payload.name
    if payload.address is not None:
        prop.address = payload.address
    if payload.price is not None:
        prop.price = payload.price
    db.commit()
    db.refresh(prop)
    return prop

# Tenant property function
@router.post("/{owner_id}/property/{property_id}/tenant/{tenant_id}",response_model=TenantPropertyView)
def assign_property_tenant(owner_id: int, property_id: int, tenant_id: int, payload: AssignProperty, db: Session = Depends(get_db),current_user=Depends(get_current_user)):

    prop = db.query(Property).filter(Property.id==property_id).first()
    tenant = db.query(User).filter(User.id==tenant_id, User.owner_id==owner_id).first()
    if not prop: 
        raise HTTPException(status_code=404, detail="Property id is invalid")
    elif not tenant:
        raise HTTPException(status_code=404, detail="tenant id is invalid")
    
    if not (current_user["role"]=="admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied")
    
    tenant_property = PropertyTenant(property_id=property_id, tenant_id=tenant_id, start_date=payload.start_date, end_date=payload.end_date)
    db.add(tenant_property)
    db.commit()
    db.refresh(tenant_property)
    return tenant_property


@router.put("/{owner_id}/property/{property_id}/tenant/{tenant_id}/edit/{pt_id}",response_model=TenantPropertyView)
def edit_property_tenant(owner_id: int, property_id: int, tenant_id: int, pt_id: int,payload: EditTenantProperty, db: Session = Depends(get_db),current_user=Depends(get_current_user)):
    
    prop = db.query(Property).filter(Property.id==property_id,Property.owner_id==owner_id).first()
    tenant = db.query(User).filter(User.id==tenant_id, User.owner_id==owner_id).first()
    tenant_property = db.query(PropertyTenant).filter(PropertyTenant.id==pt_id, PropertyTenant.property_id==property_id, PropertyTenant.tenant_id==tenant_id).first()
    if not prop: 
        raise HTTPException(status_code=404, detail="property id is invalid")
    elif not tenant:
        raise HTTPException(status_code=404, detail="tenant id is invalid")
    elif not tenant_property:
        raise HTTPException(status_code=404, detail="Tenant property id is invalid")
    
    if not (current_user["role"]=="admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id)):
        raise HTTPException(status_code=403, detail="Access denied")
   
    prop = db.query(Property).filter(Property.id==payload.property_id,Property.owner_id==owner_id).first()
    if payload.property_id is not None and prop: 
        tenant_property.property_id = payload.property_id
    
    tenant = db.query(User).filter(User.id==payload.tenant_id, User.owner_id==owner_id).first()
    if payload.tenant_id is not None and tenant:  
        tenant_property.tenant_id = payload.tenant_id
    
    if payload.start_date is not None: 
        tenant_property.start_date = payload.start_date

    if payload.end_date is not None: 
        tenant_property.end_date = payload.end_date

    if payload.status is not None and payload.status != "occupied": 
        tenant_property.status = payload.status
    
    db.commit()
    db.refresh(tenant_property)
    return tenant_property
    
@router.delete("/{owner_id}/tenant_property/{pt_id}", response_model=TenantPropertyView)
def delete_tenant_property(owner_id: int, pt_id: int, db: Session=Depends(get_db), current_user=Depends(get_current_user)):

    tenant_property = db.query(PropertyTenant).filter(PropertyTenant.id==pt_id).first()
    if not tenant_property:
        raise HTTPException(status_code=404, detail="Tenant property not found")

    prop = db.query(Property).filter(Property.id==tenant_property.property_id).first()

    if not (current_user["role"]=="admin" or (current_user["role"] == "owner" and current_user["user_id"] == owner_id and prop.owner_id==owner_id)):
        raise HTTPException(status_code=403, detail="Access denied") 
    tp_data = TenantPropertyView(id=tenant_property.id, property_id=tenant_property.property_id, tenant_id=tenant_property.tenant_id, start_date=tenant_property.start_date, end_date=tenant_property.end_date, status=tenant_property.status)
    db.delete(tenant_property)
    db.commit()
    return tp_data


@router.get("/{owner_id}/tenants/properties", response_model=TenantWithPropertiesList)
def get_tenants_with_properties(owner_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user["role"] != "admin" and current_user["user_id"] != owner_id:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    tenants = db.query(User).filter(User.owner_id == owner_id, User.role == "tenant").all()

    result = []
    for tenant in tenants:
        assignments = db.query(PropertyTenant).filter(PropertyTenant.tenant_id == tenant.id).all()
        props = []
        total = 0
        for assignment in assignments:
            prop = db.query(Property).filter(Property.id == assignment.property_id).first()
            if prop:
                props.append(TenantPropertySummary(pt_id=assignment.id, property_name=prop.name, address=prop.address, price=prop.price))
                total += prop.price
        result.append(TenantWithProperties(tenant_id=tenant.id, tenant_name=tenant.name, assigned_properties=props, total_price=total))

    return {"owner_name": owner.name, "tenants": result}


@router.get("/{owner_id}/properties/unassigned", response_model=UnassignedPropertyList)
def get_unassigned_properties(owner_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user["role"] != "admin" and current_user["user_id"] != owner_id:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    owner_property_ids = [row[0] for row in db.query(Property.id).filter(Property.owner_id == owner_id).all()]
    assigned_property_ids = db.query(PropertyTenant.property_id).filter(PropertyTenant.property_id.in_(owner_property_ids)).distinct().all()
    assigned_ids = [row[0] for row in assigned_property_ids]

    unassigned = db.query(Property).filter(Property.owner_id == owner_id, Property.id.notin_(assigned_ids)).all()

    return {"owner_name": owner.name, "count": len(unassigned), "properties": unassigned}


@router.get("/{owner_id}/tenants/unassigned", response_model=UnassignedTenantList)
def get_unassigned_tenants(owner_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user["role"] != "admin" and current_user["user_id"] != owner_id:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = db.query(User).filter(User.id == owner_id, User.role == "owner").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    owner_property_ids = [row[0] for row in db.query(Property.id).filter(Property.owner_id == owner_id).all()]
    assigned_tenant_ids = db.query(PropertyTenant.tenant_id).filter(PropertyTenant.property_id.in_(owner_property_ids)).distinct().all()
    assigned_ids = [row[0] for row in assigned_tenant_ids]

    unassigned = db.query(User).filter(User.owner_id == owner_id, User.role == "tenant", User.id.notin_(assigned_ids)).all()

    return {"owner_name": owner.name, "count": len(unassigned), "tenants": unassigned}